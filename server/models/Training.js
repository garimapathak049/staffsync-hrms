const m = require('mongoose');
const s = new m.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  instructor: { type: String, required: true },
  department: String, // empty = open to everyone
  startDate: { type: Date, required: true, index: true },
  endDate: { type: Date, required: true },
  location: String,
  capacity: { type: Number, required: true, min: 1 },
  enrolled: [{ type: m.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['Scheduled', 'Closed', 'Cancelled', 'Completed'], default: 'Scheduled', index: true },
  createdBy: { type: m.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
module.exports = m.model('Training', s);
