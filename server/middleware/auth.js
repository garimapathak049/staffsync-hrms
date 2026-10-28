const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const COOKIE_NAME = 'staffsync_token';

// Accepts httpOnly cookie (preferred) or Bearer header.
const authenticate = asyncHandler(async (req, _res, next) => {
  let token = req.cookies?.[COOKIE_NAME];
  const header = req.headers.authorization;
  if (!token && header?.startsWith('Bearer ')) token = header.slice(7);
  if (!token) throw new AppError('Authentication required', 401);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new AppError(err.name === 'TokenExpiredError' ? 'Session expired, please log in again' : 'Invalid token', 401);
  }

  const user = await User.findById(payload.sub);
  if (!user || user.accountStatus !== 'ACTIVE') throw new AppError('Account not found or deactivated', 401);
  req.user = user;
  next();
});

const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new AppError('Authentication required', 401));
  if (!roles.includes(req.user.role)) return next(new AppError('You do not have permission to perform this action', 403));
  next();
};

module.exports = { authenticate, authorize, COOKIE_NAME };
