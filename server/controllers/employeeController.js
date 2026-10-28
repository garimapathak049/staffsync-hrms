const User = require('../models/User');
const AppError = require('../utils/AppError');
const wrap = require('../utils/asyncHandler');
const { page, pick, oid } = require('../utils/helpers');

const HR_FIELDS = ['name', 'email', 'employeeId', 'department', 'designation', 'managerId', 'phone', 'joiningDate', 'salary', 'emergencyContact', 'address'];
const SELF_FIELDS = ['phone', 'address', 'emergencyContact'];

async function checkManager(managerId) {
  if (!managerId) return;
  const m = await User.findById(oid(managerId));
  if (!m || m.role !== 'MANAGER' || m.accountStatus !== 'ACTIVE') throw new AppError('managerId must reference an active manager', 400);
}

exports.list = wrap(async (req, res) => {
  const { q, department, role, status } = req.query;
  const { page: p, limit, skip } = page(req.query);
  const f = {};
  if (department) f.department = String(department);
  if (role) f.role = String(role);
  if (status) f.accountStatus = String(status);
  if (q) { const r = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); f.$or = [{ name: r }, { employeeId: r }]; }
  const [items, total] = await Promise.all([User.find(f).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('managerId', 'name'), User.countDocuments(f)]);
  res.json({ success: true, items, total, page: p, pages: Math.ceil(total / limit) });
});

exports.team = wrap(async (req, res) => {
  const items = await User.find({ managerId: req.user.id, accountStatus: 'ACTIVE' }).sort('name');
  res.json({ success: true, items });
});

exports.get = wrap(async (req, res) => {
  const sel = req.user.role === 'HR' ? '+salary' : '';
  const u = await User.findById(oid(req.params.id)).select(sel);
  if (!u) throw new AppError('Employee not found', 404);
  const own = u.id === req.user.id, mine = u.managerId?.toString() === req.user.id;
  if (req.user.role !== 'HR' && !own && !(req.user.role === 'MANAGER' && mine)) throw new AppError('Not allowed', 403);
  res.json({ success: true, user: u });
});

exports.create = wrap(async (req, res) => {
  const { password, role } = req.body;
  if (!['MANAGER', 'EMPLOYEE'].includes(role)) throw new AppError('role must be MANAGER or EMPLOYEE', 400);
  await checkManager(req.body.managerId);
  const u = new User({ ...pick(req.body, HR_FIELDS), role, mustChangePassword: true });
  await u.setPassword(password);
  await u.save();
  res.status(201).json({ success: true, user: u });
});

exports.update = wrap(async (req, res) => {
  const u = await User.findById(oid(req.params.id));
  if (!u) throw new AppError('Employee not found', 404);
  const data = pick(req.body, HR_FIELDS);
  if (data.managerId) {
    if (data.managerId === u.id) throw new AppError('A user cannot manage themselves', 400);
    await checkManager(data.managerId);
  }
  u.set(data);
  await u.save();
  res.json({ success: true, user: u });
});

exports.updateMe = wrap(async (req, res) => {
  const u = await User.findById(req.user.id);
  u.set(pick(req.body, SELF_FIELDS)); // role, salary, manager, status can never be set here
  await u.save();
  res.json({ success: true, user: u });
});

exports.setStatus = wrap(async (req, res) => {
  if (req.params.id === req.user.id) throw new AppError('You cannot deactivate your own account', 400);
  const u = await User.findByIdAndUpdate(oid(req.params.id), { accountStatus: req.body.status }, { new: true });
  if (!u) throw new AppError('Employee not found', 404);
  res.json({ success: true, user: u });
});
