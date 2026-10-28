const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { COOKIE_NAME } = require('../middleware/auth');

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 24 * 60 * 60 * 1000,
});

const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash');
  // Same message for unknown email and wrong password to avoid user enumeration
  if (!user || !(await user.verifyPassword(password))) throw new AppError('Invalid email or password', 401);
  if (user.accountStatus !== 'ACTIVE') throw new AppError('This account has been deactivated', 403);

  const token = signToken(user);
  res.cookie(COOKIE_NAME, token, cookieOptions());
  res.json({ success: true, token, user });
});

exports.logout = (_req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  res.json({ success: true, message: 'Logged out' });
};

exports.me = (req, res) => res.json({ success: true, user: req.user });

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+passwordHash');
  if (!(await user.verifyPassword(currentPassword))) throw new AppError('Current password is incorrect', 400);
  await user.setPassword(newPassword);
  user.mustChangePassword = false;
  await user.save();
  res.json({ success: true, message: 'Password updated' });
});
