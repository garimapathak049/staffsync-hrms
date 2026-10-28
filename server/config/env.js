require('dotenv').config();

const required = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];

function loadConfig() {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. Copy .env.example to .env and fill them in.`
    );
  }
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long.');
  }
  return {
    port: Number(process.env.PORT) || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    clientUrl: process.env.CLIENT_URL,
  };
}

module.exports = { loadConfig };
