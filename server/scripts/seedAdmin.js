const { loadConfig } = require('../config/env');
const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  try {
    const cfg = loadConfig();
    const { SEED_HR_NAME, SEED_HR_EMAIL, SEED_HR_PASSWORD } = process.env;
    if (!SEED_HR_EMAIL || !SEED_HR_PASSWORD) throw new Error('SEED_HR_EMAIL and SEED_HR_PASSWORD must be set in .env');
    await connectDB(cfg.mongoUri);

    const existing = await User.findOne({ role: 'HR' });
    if (existing) { console.log(`HR administrator already exists (${existing.email}). Nothing to do.`); return; }

    const hr = new User({
      name: SEED_HR_NAME || 'HR Administrator',
      email: SEED_HR_EMAIL,
      role: 'HR',
      employeeId: 'HR-0001',
      department: 'Human Resources',
      designation: 'HR Administrator',
      mustChangePassword: true,
    });
    await hr.setPassword(SEED_HR_PASSWORD);
    await hr.save();
    console.log(`HR administrator created: ${hr.email} (password change required on first login)`);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await require('mongoose').disconnect();
  }
})();
