const mongoose = require('mongoose');
const AppError = require('./AppError');
exports.dateKey = (d = new Date()) => d.toISOString().slice(0, 10);
exports.page = (q) => {
  const page = Math.max(1, parseInt(q.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(q.limit) || 10));
  return { page, limit, skip: (page - 1) * limit };
};
exports.pick = (o, keys) => Object.fromEntries(keys.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));
exports.oid = (id) => { if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid identifier', 400); return id; };
// Inclusive working days (Mon-Fri). No public-holiday calendar: documented limitation.
exports.workingDays = (start, end) => {
  let n = 0; const d = new Date(start);
  while (d <= end) { const w = d.getUTCDay(); if (w !== 0 && w !== 6) n++; d.setUTCDate(d.getUTCDate() + 1); }
  return n;
};
