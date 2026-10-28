const mongoose = require('mongoose');
const s = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD, server clock
  checkIn: Date,
  checkOut: Date,
  workingHours: { type: Number, default: 0 },
  status: { type: String, enum: ['Present', 'Late', 'Half Day', 'Absent'], default: 'Present' },
  notes: String,
  correction: { by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, reason: String, at: Date },
}, { timestamps: true });
s.index({ employee: 1, date: 1 }, { unique: true });
s.index({ date: 1, status: 1 });
module.exports = mongoose.model('Attendance', s);
