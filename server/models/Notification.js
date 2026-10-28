const m = require('mongoose');
const s = new m.Schema({
  recipient: { type: m.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  category: { type: String, enum: ['Leave', 'Announcement', 'Training', 'System'], default: 'System' },
  link: String,
  read: { type: Boolean, default: false },
}, { timestamps: true });
s.index({ recipient: 1, read: 1, createdAt: -1 });
module.exports = m.model('Notification', s);
