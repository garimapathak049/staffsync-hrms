const { loadConfig } = require('./config/env');
const connectDB = require('./config/db');

(async () => {
  try {
    const cfg = loadConfig();
    await connectDB(cfg.mongoUri);
    console.log('MongoDB connected');
    const app = require('./app')();
    app.listen(cfg.port, () => console.log(`StaffSync API listening on port ${cfg.port}`));
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }
})();
