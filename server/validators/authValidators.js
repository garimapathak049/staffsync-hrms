const { body } = require('express-validator');

exports.login = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required'),
];

exports.changePassword = [
  body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isString().isLength({ min: 8, max: 72 }).withMessage('New password must be 8-72 characters')
    .matches(/[A-Za-z]/).withMessage('Must contain a letter')
    .matches(/\d/).withMessage('Must contain a number'),
];
