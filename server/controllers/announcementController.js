const A = require('../models/Announcement');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const wrap = require('../utils/asyncHandler');
const { notify } = require('../services/notify');
const { pick, oid, page } = require('../utils/helpers');
const FIELDS = ['title', 'description', 'category', 'audience', 'expiresAt'];

const visibleTo = (u) => ({
  published: true,
  $and: [
    { $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }] },
    { $or: [{ 'audience.type': 'ALL' }, { 'audience.department': u.department }] },
  ],
});

async function pushNotifications(a) {
  const f = { accountStatus: 'ACTIVE', _id: { $ne: a.author } };
  if (a.audience.type === 'DEPARTMENT') f.department = a.audience.department;
  const ids = await User.find(f).distinct('_id');
  await notify(ids, { title: 'New announcement', message: a.title, category: 'Announcement', link: `/announcements/${a.id}` });
}

exports.list = wrap(async (req, res) => {
  const { page: p, limit, skip } = page(req.query);
  const f = req.user.role === 'HR' ? {} : visibleTo(req.user);
  if (req.user.role === 'HR' && req.query.published) f.published = req.query.published === 'true';
  if (req.query.category) f.category = String(req.query.category);
  const [items, total] = await Promise.all([A.find(f).sort('-createdAt').skip(skip).limit(limit).populate('author', 'name'), A.countDocuments(f)]);
  res.json({ success: true, items, total, page: p });
});

exports.get = wrap(async (req, res) => {
  const a = await A.findOne({ _id: oid(req.params.id), ...(req.user.role === 'HR' ? {} : visibleTo(req.user)) }).populate('author', 'name');
  if (!a) throw new AppError('Announcement not found', 404);
  res.json({ success: true, announcement: a });
});

exports.create = wrap(async (req, res) => {
  const a = await A.create({ ...pick(req.body, FIELDS), author: req.user.id });
  res.status(201).json({ success: true, announcement: a });
});

exports.update = wrap(async (req, res) => {
  const a = await A.findByIdAndUpdate(oid(req.params.id), pick(req.body, FIELDS), { new: true, runValidators: true });
  if (!a) throw new AppError('Announcement not found', 404);
  res.json({ success: true, announcement: a });
});

exports.publish = wrap(async (req, res) => {
  const a = await A.findById(oid(req.params.id));
  if (!a) throw new AppError('Announcement not found', 404);
  const publish = req.body.published !== false;
  const first = publish && !a.publishedAt;
  a.published = publish;
  if (first) a.publishedAt = new Date();
  await a.save();
  if (first) await pushNotifications(a); // notify only on first publication
  res.json({ success: true, announcement: a });
});

exports.remove = wrap(async (req, res) => {
  const a = await A.findByIdAndDelete(oid(req.params.id));
  if (!a) throw new AppError('Announcement not found', 404);
  res.json({ success: true });
});
