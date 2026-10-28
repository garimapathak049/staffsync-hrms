const Leave = require('../models/Leave');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const wrap = require('../utils/asyncHandler');
const { page, oid, workingDays } = require('../utils/helpers');
const { notify } = require('../services/notify');

// Default policy (configurable via env, illustrative only). Unpaid has no cap.
const ENTITLEMENT = { Casual: +process.env.LEAVE_CASUAL || 12, Sick: +process.env.LEAVE_SICK || 10, Earned: +process.env.LEAVE_EARNED || 15 };

async function balances(userId) {
  const year = new Date().getUTCFullYear();
  const used = await Leave.aggregate([
    { $match: { employee: userId, status: 'Approved', startDate: { $gte: new Date(Date.UTC(year, 0, 1)), $lt: new Date(Date.UTC(year + 1, 0, 1)) } } },
    { $group: { _id: '$leaveType', days: { $sum: '$days' } } },
  ]);
  const u = Object.fromEntries(used.map((x) => [x._id, x.days]));
  return Object.fromEntries(Object.entries(ENTITLEMENT).map(([k, v]) => [k, { entitled: v, used: u[k] || 0, remaining: v - (u[k] || 0) }]));
}

exports.create = wrap(async (req, res) => {
  const { leaveType, reason } = req.body;
  const startDate = new Date(req.body.startDate), endDate = new Date(req.body.endDate);
  if (isNaN(startDate) || isNaN(endDate) || endDate < startDate) throw new AppError('Invalid date range', 400);
  const days = workingDays(startDate, endDate);
  if (days < 1) throw new AppError('Selected range has no working days', 400);
  const overlap = await Leave.findOne({ employee: req.user.id, status: { $in: ['Pending', 'Approved'] }, startDate: { $lte: endDate }, endDate: { $gte: startDate } });
  if (overlap) throw new AppError('Overlaps with an existing leave request', 409);
  const bal = (await balances(req.user._id))[leaveType];
  if (bal && days > bal.remaining) throw new AppError(`Insufficient ${leaveType} leave balance (${bal.remaining} left)`, 400);
  const leave = await Leave.create({ employee: req.user.id, leaveType, startDate, endDate, days, reason });
  if (req.user.managerId) await notify([req.user.managerId], { title: 'New leave request', message: `${req.user.name} requested ${days} day(s) of ${leaveType} leave`, category: 'Leave', link: '/leave-approvals' });
  res.status(201).json({ success: true, leave });
});

exports.me = wrap(async (req, res) => {
  const items = await Leave.find({ employee: req.user.id }).sort('-createdAt').populate('reviewer', 'name');
  res.json({ success: true, items, balances: await balances(req.user._id) });
});

async function list(req, res, employeeIds) {
  const { status, employee } = req.query;
  const { page: p, limit, skip } = page(req.query);
  const f = {};
  if (employeeIds) f.employee = { $in: employeeIds };
  if (employee) { oid(employee); f.employee = !employeeIds || employeeIds.map(String).includes(employee) ? employee : { $in: [] }; }
  if (status) f.status = String(status);
  const [items, total] = await Promise.all([Leave.find(f).sort('-createdAt').skip(skip).limit(limit).populate('employee', 'name employeeId department').populate('reviewer', 'name'), Leave.countDocuments(f)]);
  res.json({ success: true, items, total, page: p });
}
exports.all = wrap((req, res) => list(req, res, null));
exports.team = wrap(async (req, res) => list(req, res, await User.find({ managerId: req.user.id }).distinct('_id')));

exports.get = wrap(async (req, res) => {
  const l = await Leave.findById(oid(req.params.id)).populate('employee', 'name employeeId department managerId').populate('reviewer', 'name');
  if (!l) throw new AppError('Leave request not found', 404);
  const isOwner = l.employee.id === req.user.id, isMgr = l.employee.managerId?.toString() === req.user.id;
  if (req.user.role !== 'HR' && !isOwner && !(req.user.role === 'MANAGER' && isMgr)) throw new AppError('Not allowed', 403);
  res.json({ success: true, leave: l });
});

exports.review = wrap(async (req, res) => {
  const { decision, remarks } = req.body; // 'Approved' | 'Rejected'
  const l = await Leave.findById(oid(req.params.id)).populate('employee', 'managerId');
  if (!l) throw new AppError('Leave request not found', 404);
  if (l.employee.id === req.user.id) throw new AppError('You cannot review your own leave', 403);
  if (req.user.role === 'MANAGER' && l.employee.managerId?.toString() !== req.user.id) throw new AppError('This employee is not on your team', 403);
  if (decision === 'Approved') {
    const bal = (await balances(l.employee._id))[l.leaveType];
    if (bal && l.days > bal.remaining) throw new AppError('Employee has insufficient balance', 400);
  }
  // Atomic: only a still-Pending request can be decided, so concurrent reviewers cannot both win
  const upd = await Leave.findOneAndUpdate({ _id: l._id, status: 'Pending' }, { status: decision, reviewer: req.user.id, reviewRemarks: remarks, reviewedAt: new Date() }, { new: true });
  if (!upd) throw new AppError('This request has already been processed', 409);
  await notify([l.employee._id], { title: `Leave ${decision.toLowerCase()}`, message: `Your ${l.leaveType} leave was ${decision.toLowerCase()} by ${req.user.name}${remarks ? ': ' + remarks : ''}`, category: 'Leave', link: '/my-leaves' });
  res.json({ success: true, leave: upd });
});

exports.cancel = wrap(async (req, res) => {
  const upd = await Leave.findOneAndUpdate({ _id: oid(req.params.id), employee: req.user.id, status: 'Pending' }, { status: 'Cancelled' }, { new: true });
  if (!upd) throw new AppError('Only your own pending requests can be cancelled', 400);
  res.json({ success: true, leave: upd });
});
