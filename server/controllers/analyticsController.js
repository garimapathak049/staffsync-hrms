const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Training = require('../models/Training');
const AppError = require('../utils/AppError');
const wrap = require('../utils/asyncHandler');
const { dateKey } = require('../utils/helpers');

const daysAgo = (n) => dateKey(new Date(Date.now() - n * 864e5));
const toObj = (a) => a.map((x) => ({ label: x._id || 'Unassigned', value: x.count }));

async function summary(scopeIds) {
  const today = dateKey();
  const uf = scopeIds ? { _id: { $in: scopeIds } } : { role: { $ne: 'HR' } };
  const ef = scopeIds ? { employee: { $in: scopeIds } } : {};
  const [total, active, managers, present, pendingLeaves, upcoming, dept, leaveStatus, trend, late] = await Promise.all([
    User.countDocuments(uf), User.countDocuments({ ...uf, accountStatus: 'ACTIVE' }), User.countDocuments({ role: 'MANAGER' }),
    Attendance.countDocuments({ ...ef, date: today }),
    Leave.countDocuments({ ...ef, status: 'Pending' }),
    Training.countDocuments({ status: 'Scheduled', startDate: { $gte: new Date() } }),
    User.aggregate([{ $match: uf }, { $group: { _id: '$department', count: { $sum: 1 } } }]),
    Leave.aggregate([{ $match: ef }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Attendance.aggregate([{ $match: { ...ef, date: { $gte: daysAgo(6) } } }, { $group: { _id: '$date', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Attendance.countDocuments({ ...ef, date: today, status: 'Late' }),
  ]);
  return { totals: { total, active, managers, presentToday: present, absentToday: Math.max(0, active - present), lateToday: late, pendingLeaves, upcomingTrainings: upcoming }, departments: toObj(dept), leaveStatus: toObj(leaveStatus), attendanceTrend: trend.map((x) => ({ date: x._id, present: x.count })) };
}
exports.hr = wrap(async (_req, res) => res.json({ success: true, ...(await summary(null)) }));
exports.manager = wrap(async (req, res) => {
  const ids = await User.find({ managerId: req.user.id, accountStatus: 'ACTIVE' }).distinct('_id');
  const s = await summary(ids);
  const [hours] = await Attendance.aggregate([{ $match: { employee: { $in: ids }, date: { $gte: daysAgo(29) } } }, { $group: { _id: null, avg: { $avg: '$workingHours' }, days: { $sum: 1 } } }]);
  // Transparent metrics only: counts and averages from real records, no invented scores.
  res.json({ success: true, ...s, performance: { teamSize: ids.length, avgWorkingHours30d: hours ? +hours.avg.toFixed(2) : 0, attendanceRecords30d: hours?.days || 0, note: 'Average of recorded working hours over the last 30 days; no productivity score is computed.' } });
});

const esc = (v) => { let s = v == null ? '' : v instanceof Date ? v.toISOString() : String(v); if (/^[=+\-@]/.test(s)) s = "'" + s; return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const csv = (rows) => rows.map((r) => r.map(esc).join(',')).join('\n');

exports.exportCsv = wrap(async (req, res) => {
  const { from, to, department } = req.query;
  const dr = (k) => (from || to ? { [k]: { ...(from && { $gte: from }), ...(to && { $lte: to }) } } : {});
  let rows;
  const userIds = department ? await User.find({ department }).distinct('_id') : null;
  const ef = userIds ? { employee: { $in: userIds } } : {};
  switch (req.params.type) {
    case 'headcount': {
      const u = await User.find({ role: { $ne: 'HR' }, ...(department && { department }) }).populate('managerId', 'name');
      rows = [['Employee ID', 'Name', 'Email', 'Role', 'Department', 'Designation', 'Manager', 'Status'], ...u.map((x) => [x.employeeId, x.name, x.email, x.role, x.department, x.designation, x.managerId?.name, x.accountStatus])]; break; }
    case 'attendance': {
      const a = await Attendance.find({ ...ef, ...dr('date') }).sort('date').populate('employee', 'name employeeId department').limit(10000);
      rows = [['Date', 'Employee ID', 'Name', 'Department', 'Check-in', 'Check-out', 'Hours', 'Status'], ...a.map((x) => [x.date, x.employee?.employeeId, x.employee?.name, x.employee?.department, x.checkIn, x.checkOut, x.workingHours, x.status])]; break; }
    case 'leaves': {
      const l = await Leave.find({ ...ef, ...(from || to ? { startDate: { ...(from && { $gte: new Date(from) }), ...(to && { $lte: new Date(to) }) } } : {}) }).populate('employee', 'name employeeId department').populate('reviewer', 'name').limit(10000);
      rows = [['Employee ID', 'Name', 'Type', 'Start', 'End', 'Days', 'Status', 'Reviewer', 'Remarks'], ...l.map((x) => [x.employee?.employeeId, x.employee?.name, x.leaveType, x.startDate, x.endDate, x.days, x.status, x.reviewer?.name, x.reviewRemarks])]; break; }
    case 'trainings': {
      const t = await Training.find({ ...(department && { department }) }).sort('startDate');
      rows = [['Title', 'Instructor', 'Department', 'Start', 'End', 'Capacity', 'Enrolled', 'Status'], ...t.map((x) => [x.title, x.instructor, x.department, x.startDate, x.endDate, x.capacity, x.enrolled.length, x.status])]; break; }
    default: throw new AppError('Unknown report type', 404);
  }
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${req.params.type}-report.csv"` }).send(csv(rows));
});
