const T = require('../models/Training');
const AppError = require('../utils/AppError');
const wrap = require('../utils/asyncHandler');
const { notify } = require('../services/notify');
const { pick, oid, page } = require('../utils/helpers');
const FIELDS = ['title', 'description', 'instructor', 'department', 'startDate', 'endDate', 'location', 'capacity'];

async function ownedOrHR(req) {
  const t = await T.findById(oid(req.params.id));
  if (!t) throw new AppError('Training not found', 404);
  if (req.user.role !== 'HR' && t.createdBy.toString() !== req.user.id) throw new AppError('You can only manage trainings you created', 403);
  return t;
}
const checkDates = (d) => { if (d.startDate && d.endDate && new Date(d.endDate) < new Date(d.startDate)) throw new AppError('endDate must be after startDate', 400); };

exports.list = wrap(async (req, res) => {
  const { page: p, limit, skip } = page(req.query);
  const f = {};
  if (req.query.status) f.status = String(req.query.status);
  if (req.user.role === 'EMPLOYEE') f.$or = [{ department: null }, { department: '' }, { department: req.user.department }];
  const [items, total] = await Promise.all([T.find(f).sort('startDate').skip(skip).limit(limit).populate('createdBy', 'name'), T.countDocuments(f)]);
  const out = items.map((t) => ({ ...t.toJSON(), enrolledCount: t.enrolled.length, isEnrolled: t.enrolled.some((e) => e.toString() === req.user.id), enrolled: req.user.role === 'EMPLOYEE' ? undefined : t.enrolled }));
  res.json({ success: true, items: out, total, page: p });
});

exports.get = wrap(async (req, res) => {
  const t = await T.findById(oid(req.params.id)).populate('enrolled', 'name employeeId department').populate('createdBy', 'name');
  if (!t) throw new AppError('Training not found', 404);
  const json = t.toJSON();
  json.enrolledCount = t.enrolled.length;
  json.isEnrolled = t.enrolled.some((e) => e.id === req.user.id);
  if (req.user.role === 'EMPLOYEE') json.enrolled = undefined; // participants visible to HR/managers only
  res.json({ success: true, training: json });
});

exports.create = wrap(async (req, res) => {
  const d = pick(req.body, FIELDS); checkDates(d);
  if (req.user.role === 'MANAGER') d.department = req.user.department; // managers target their own department
  const t = await T.create({ ...d, createdBy: req.user.id });
  res.status(201).json({ success: true, training: t });
});

exports.update = wrap(async (req, res) => {
  const t = await ownedOrHR(req);
  const d = pick(req.body, FIELDS); checkDates({ startDate: d.startDate || t.startDate, endDate: d.endDate || t.endDate });
  if (d.capacity && d.capacity < t.enrolled.length) throw new AppError('Capacity cannot be lower than current enrollment', 400);
  t.set(d); await t.save();
  await notify(t.enrolled, { title: 'Training updated', message: t.title, category: 'Training', link: `/trainings/${t.id}` });
  res.json({ success: true, training: t });
});

exports.setStatus = wrap(async (req, res) => {
  const t = await ownedOrHR(req);
  t.status = req.body.status; await t.save();
  await notify(t.enrolled, { title: `Training ${t.status.toLowerCase()}`, message: t.title, category: 'Training', link: `/trainings/${t.id}` });
  res.json({ success: true, training: t });
});

exports.enroll = wrap(async (req, res) => {
  const t0 = await T.findById(oid(req.params.id));
  if (!t0) throw new AppError('Training not found', 404);
  if (t0.department && t0.department !== req.user.department) throw new AppError('This training is for another department', 403);
  // Atomic guard: open, not already enrolled, and seats left - all in one update
  const t = await T.findOneAndUpdate(
    { _id: t0._id, status: 'Scheduled', enrolled: { $ne: req.user._id }, startDate: { $gt: new Date() }, $expr: { $lt: [{ $size: '$enrolled' }, '$capacity'] } },
    { $addToSet: { enrolled: req.user._id } }, { new: true });
  if (!t) {
    if (t0.enrolled.some((e) => e.toString() === req.user.id)) throw new AppError('Already enrolled', 409);
    if (t0.status !== 'Scheduled') throw new AppError('Enrollment is closed', 400);
    if (t0.enrolled.length >= t0.capacity) throw new AppError('Training is full', 409);
    throw new AppError('Training has already started', 400);
  }
  await notify([req.user.id], { title: 'Enrollment confirmed', message: t.title, category: 'Training', link: `/trainings/${t.id}` });
  res.json({ success: true, training: t });
});

exports.unenroll = wrap(async (req, res) => {
  const t = await T.findOneAndUpdate({ _id: oid(req.params.id), enrolled: req.user._id, startDate: { $gt: new Date() } }, { $pull: { enrolled: req.user._id } }, { new: true });
  if (!t) throw new AppError('You are not enrolled, or the training has already started', 400);
  res.json({ success: true, training: t });
});
