const mongoose = require('mongoose');
const s = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  leaveType: { type: String, enum: ['Casual', 'Sick', 'Earned', 'Unpaid'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  days: { type: Number, required: true, min: 1 },
  reason: { type: String, required: true, maxlength: 500 },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], default: 'Pending', index: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewRemarks: String,
  reviewedAt: Date,
}, { timestamps: true });
module.exports = mongoose.model('Leave', s);
