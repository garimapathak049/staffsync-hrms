const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { notFound, errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => res.json({ success: true, status: 'ok' }));
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/employees', require('./routes/employeeRoutes'));
  app.use('/api/attendance', require('./routes/attendanceRoutes'));
  app.use('/api/leaves', require('./routes/leaveRoutes'));
  const x = require('./routes/extraRoutes');
  app.use('/api/announcements', x.ann);
  app.use('/api/trainings', x.tr);
  app.use('/api/notifications', x.no);
  app.use('/api/analytics', x.an);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = createApp;
