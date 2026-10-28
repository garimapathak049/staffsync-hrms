// DEMO DATA ONLY. Wipes and recreates all collections. Never run against production.
const { loadConfig } = require('../config/env');
const connectDB = require('../config/db');
const User = require('../models/User'), Attendance = require('../models/Attendance'), Leave = require('../models/Leave');
const Announcement = require('../models/Announcement'), Training = require('../models/Training'), Notification = require('../models/Notification');
const { dateKey } = require('../utils/helpers');
const PW = 'Demo@12345';
const day = (n) => new Date(Date.now() + n * 864e5);

(async () => {
  try {
    const cfg = loadConfig();
    if (cfg.nodeEnv === 'production') throw new Error('Refusing to seed demo data in production');
    await connectDB(cfg.mongoUri);
    await Promise.all([User, Attendance, Leave, Announcement, Training, Notification].map((m) => m.deleteMany({})));
    const mk = async (d) => { const u = new User(d); await u.setPassword(PW); return u.save(); };
    const hr = await mk({ name: 'Anita Sharma', email: 'hr@staffsync.demo', role: 'HR', employeeId: 'HR-001', department: 'Human Resources', designation: 'HR Administrator' });
    const m1 = await mk({ name: 'Rahul Verma', email: 'manager1@staffsync.demo', role: 'MANAGER', employeeId: 'MGR-001', department: 'Engineering', designation: 'Engineering Manager' });
    const m2 = await mk({ name: 'Priya Nair', email: 'manager2@staffsync.demo', role: 'MANAGER', employeeId: 'MGR-002', department: 'Sales', designation: 'Sales Manager' });
    const spec = [['Aman Gupta', 'Engineering', 'Software Engineer', m1], ['Neha Singh', 'Engineering', 'QA Engineer', m1], ['Karan Mehta', 'Engineering', 'DevOps Engineer', m1], ['Sara Khan', 'Engineering', 'UI Developer', m1],
      ['Vikram Rao', 'Sales', 'Sales Executive', m2], ['Divya Iyer', 'Sales', 'Account Manager', m2], ['Rohan Das', 'Sales', 'Sales Executive', m2], ['Meera Joshi', 'Sales', 'Business Analyst', m2]];
    const emps = [];
    for (const [i, [name, department, designation, mgr]] of spec.entries())
      emps.push(await mk({ name, email: `employee${i + 1}@staffsync.demo`, role: 'EMPLOYEE', employeeId: `EMP-${String(i + 1).padStart(3, '0')}`, department, designation, managerId: mgr._id, salary: 40000 + i * 2500, phone: `90000000${10 + i}` }));

    const att = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(Date.now() - d * 864e5); if ([0, 6].includes(date.getUTCDay())) continue;
      emps.forEach((e, i) => {
        if (d === 0 && i % 4 === 3) return; // some absent today
        const inT = new Date(date); inT.setUTCHours(3, 20 + ((i * 7 + d * 3) % 40)); const late = inT.getUTCHours() * 60 + inT.getUTCMinutes() > 4 * 60 + 30;
        const done = d > 0; const outT = new Date(inT.getTime() + (8 + (i % 3) * 0.5) * 36e5);
        att.push({ employee: e._id, date: dateKey(date), checkIn: inT, ...(done && { checkOut: outT, workingHours: +((outT - inT) / 36e5).toFixed(2) }), status: late ? 'Late' : 'Present' });
      });
    }
    await Attendance.insertMany(att);

    await Leave.insertMany([
      { employee: emps[0]._id, leaveType: 'Casual', startDate: day(5), endDate: day(6), days: 2, reason: 'Family function', status: 'Pending' },
      { employee: emps[4]._id, leaveType: 'Sick', startDate: day(2), endDate: day(2), days: 1, reason: 'Fever', status: 'Pending' },
      { employee: emps[1]._id, leaveType: 'Earned', startDate: day(-20), endDate: day(-18), days: 3, reason: 'Vacation', status: 'Approved', reviewer: m1._id, reviewRemarks: 'Enjoy!', reviewedAt: day(-25) },
      { employee: emps[5]._id, leaveType: 'Casual', startDate: day(-10), endDate: day(-10), days: 1, reason: 'Personal work', status: 'Rejected', reviewer: m2._id, reviewRemarks: 'Quarter-end deadline', reviewedAt: day(-12) },
    ]);
    const anns = await Announcement.insertMany([
      { title: 'Welcome to StaffSync', description: 'Our new HR portal is live. Mark attendance and apply for leave here.', category: 'General', author: hr._id, published: true, publishedAt: new Date() },
      { title: 'Diwali Holiday Schedule', description: 'The office will be closed for the festival break. Plan your work accordingly.', category: 'Holiday', author: hr._id, published: true, publishedAt: new Date() },
      { title: 'Engineering Sprint Demo', description: 'Sprint demo on Friday at 4 PM.', category: 'Event', author: hr._id, audience: { type: 'DEPARTMENT', department: 'Engineering' }, published: true, publishedAt: new Date() },
      { title: 'Updated Leave Policy (Draft)', description: 'Draft changes to leave policy under review.', category: 'Policy', author: hr._id, published: false },
    ]);
    await Training.insertMany([
      { title: 'Secure Coding Basics', description: 'OWASP top risks for web developers.', instructor: 'Dr. A. Kulkarni', department: 'Engineering', startDate: day(10), endDate: day(11), location: 'Room 3B', capacity: 3, enrolled: [emps[0]._id, emps[1]._id], createdBy: m1._id },
      { title: 'Effective Negotiation', description: 'Practical negotiation skills.', instructor: 'S. Bhatia', department: 'Sales', startDate: day(14), endDate: day(14), location: 'Online (Meet)', capacity: 10, enrolled: [emps[4]._id], createdBy: m2._id },
      { title: 'Workplace Communication', description: 'Open to everyone.', instructor: 'HR Team', startDate: day(20), endDate: day(20), location: 'Auditorium', capacity: 50, createdBy: hr._id },
      { title: 'Intro to Git (Completed)', description: 'Version control workshop.', instructor: 'K. Menon', department: 'Engineering', startDate: day(-30), endDate: day(-30), location: 'Room 2A', capacity: 20, enrolled: [emps[2]._id], status: 'Completed', createdBy: m1._id },
    ]);
    await Notification.insertMany(emps.slice(0, 4).map((e) => ({ recipient: e._id, title: 'New announcement', message: anns[0].title, category: 'Announcement', link: `/announcements/${anns[0].id}` })).concat([
      { recipient: emps[1]._id, title: 'Leave approved', message: 'Your Earned leave was approved by Rahul Verma: Enjoy!', category: 'Leave', link: '/my-leaves' },
      { recipient: m1._id, title: 'New leave request', message: 'Aman Gupta requested 2 day(s) of Casual leave', category: 'Leave', link: '/leave-approvals' }]));
    console.log(`Demo data created. All demo accounts use password: ${PW}\n  hr@staffsync.demo | manager1@staffsync.demo | manager2@staffsync.demo | employee1..8@staffsync.demo`);
  } catch (e) { console.error('Seed failed:', e.message); process.exitCode = 1; } finally { await require('mongoose').disconnect(); }
})();
