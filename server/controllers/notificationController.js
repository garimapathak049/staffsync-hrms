const N = require('../models/Notification');
const AppError = require('../utils/AppError');
const wrap = require('../utils/asyncHandler');
const { oid, page } = require('../utils/helpers');
exports.list = wrap(async (req, res) => {
  const { page: p, limit, skip } = page(req.query);
  const f = { recipient: req.user.id };
  if (req.query.unread === 'true') f.read = false;
  const [items, total, unread] = await Promise.all([N.find(f).sort('-createdAt').skip(skip).limit(limit), N.countDocuments(f), N.countDocuments({ recipient: req.user.id, read: false })]);
  res.json({ success: true, items, total, unread, page: p });
});
exports.read = wrap(async (req, res) => {
  const n = await N.findOneAndUpdate({ _id: oid(req.params.id), recipient: req.user.id }, { read: true }, { new: true });
  if (!n) throw new AppError('Notification not found', 404);
  res.json({ success: true, notification: n });
});
exports.readAll = wrap(async (req, res) => {
  await N.updateMany({ recipient: req.user.id, read: false }, { read: true });
  res.json({ success: true });
});
