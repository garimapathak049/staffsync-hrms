const AppError = require('../utils/AppError');

const notFound = (req, _res, next) => next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  let status = err.statusCode || 500;
  let message = err.message;
  let details = err.details;

  if (err.name === 'CastError') { status = 400; message = 'Invalid identifier'; }
  else if (err.code === 11000) {
    status = 409;
    message = `Duplicate value for ${Object.keys(err.keyPattern || {}).join(', ') || 'unique field'}`;
  } else if (err.name === 'ValidationError') {
    status = 422;
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    message = 'Validation failed';
  }

  if (status >= 500) {
    console.error(err);
    if (process.env.NODE_ENV === 'production') message = 'Internal server error';
  }
  res.status(status).json({ success: false, message, ...(details && { details }) });
};

module.exports = { notFound, errorHandler };
