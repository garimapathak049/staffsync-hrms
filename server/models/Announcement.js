const m = require('mongoose');
const s = new m.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, required: true, maxlength: 5000 },
  category: { type: String, enum: ['General', 'Policy', 'Event', 'Holiday', 'Urgent'], default: 'General', index: true },
  author: { type: m.Schema.Types.ObjectId, ref: 'User', required: true },
  audience: { type: { type: String, enum: ['ALL', 'DEPARTMENT'], default: 'ALL' }, department: String },
  published: { type: Boolean, default: false, index: true },
  publishedAt: Date,
  expiresAt: Date,
}, { timestamps: true });
module.exports = m.model('Announcement', s);
