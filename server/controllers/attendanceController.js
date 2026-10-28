const Attendance = require('../models/Attendance');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const wrap = require('../utils/asyncHandler');
const { dateKey, page, oid } = require('../utils/helpers');

const LATE_AFTER_UTC_HOUR = Number(process.env.LATE_AFTER_UTC_HOUR || 4); // 04:00 UTC = 09:30 IST
const HALF_DAY_HOURS = 4;

exports.checkIn = wrap(async (req, res) => {
  const now = new Date();
  const late = now.getUTCHours() + now.getUTCMinutes() / 60 > LATE_AFTER_UTC_HOUR + 0.5;
  try {
    const rec = await Attendance.create({ employee: req.user.id, date: dateKey(now), checkIn: now, status: late ? 'Late' : 'Present' });
    res.status(201).json({ success: true, attendance: rec });
  } catch (e) {
    if (e.code === 11000) throw new AppError('You have already checked in today', 409);
    throw e;
  }
});

exports.checkOut = wrap(async (req, res) => {
  const rec = await Attendance.findOne({ employee: req.user.id, date: dateKey() });
  if (!rec) throw new AppError('You have not checked in today', 400);
  if (rec.checkOut) throw new AppError('You have already checked out today', 409);
  rec.checkOut = new Date();
  rec.workingHours = Math.round(((rec.checkOut - rec.checkIn) / 36e5) * 100) / 100;
  if (rec.workingHours < HALF_DAY_HOURS) rec.status = 'Half Day';
  await rec.save();
  res.json({ success: true, attendance: rec });
});

exports.me = wrap(async (req, res) => {
  const { page: p, limit, skip } = page(req.query);
  const f = { employee: req.user.id };
  if (req.query.month) f.date = new RegExp(`^${String(req.query.month).replace(/[^0-9-]/g, '')}`);
  const [items, total] = await Promise.all([Attendance.find(f).sort('-date').skip(skip).limit(limit), Attendance.countDocuments(f)]);
  const today = await Attendance.findOne({ employee: req.user.id, date: dateKey() });
  res.json({ success: true, items, total, page: p, today });
});

async function query(req, res, employeeIds) {
  const { date, status, employee } = req.query;
  const { page: p, limit, skip } = page(req.query);
  const f = {};
  if (employeeIds) f.employee = { $in: employeeIds };
  if (employee) { oid(employee); if (!employeeIds || employeeIds.map(String).includes(employee)) f.employee = employee; else f.employee = { $in: [] }; }
  if (date) f.date = String(date);
  if (status) f.status = String(status);
  const [items, total] = await Promise.all([Attendance.find(f).sort('-date').skip(skip).limit(limit).populate('employee', 'name employeeId department'), Attendance.countDocuments(f)]);
  // Who has not marked attendance on the chosen date
  let notMarked = [];
  if (date) {
    const base = { role: { $ne: 'HR' }, accountStatus: 'ACTIVE', ...(employeeIds && { _id: { $in: employeeIds } }) };
    const marked = await Attendance.distinct('employee', { date: String(date) });
    notMarked = await User.find({ ...base, _id: { ...(base._id || {}), $nin: marked } }).select('name employeeId department');
  }
  res.json({ success: true, items, total, page: p, notMarked });
}
exports.all = wrap((req, res) => query(req, res, null));
exports.team = wrap(async (req, res) => query(req, res, await User.find({ managerId: req.user.id }).distinct('_id')));

exports.correct = wrap(async (req, res) => {
  const { checkIn, checkOut, status, reason } = req.body;
  const rec = await Attendance.findById(oid(req.params.id));
  if (!rec) throw new AppError('Record not found', 404);
  if (checkIn) rec.checkIn = new Date(checkIn);
  if (checkOut) rec.checkOut = new Date(checkOut);
  if (rec.checkIn && rec.checkOut) {
    if (rec.checkOut <= rec.checkIn) throw new AppError('checkOut must be after checkIn', 400);
    rec.workingHours = Math.round(((rec.checkOut - rec.checkIn) / 36e5) * 100) / 100;
  }
  if (status) rec.status = status;
  rec.correction = { by: req.user.id, reason, at: new Date() };
  await rec.save();
  res.json({ success: true, attendance: rec });
});
