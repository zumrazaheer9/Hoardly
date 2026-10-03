/**
 * Centralized error handling middleware.
 * All route errors funnel through here.
 */
export function errorHandler(err, req, res, _next) {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);

  const statusCode = err.statusCode || (err.type === 'entity.parse.failed' ? 400 : err.type === 'entity.too.large' ? 413 : 500);
  const message = err.statusCode ? err.message : statusCode === 400 ? 'The request contains invalid JSON.' : statusCode === 413 ? 'The request is too large.' : 'An unexpected error occurred. Please try again later.';

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}

/**
 * Create an error with a status code for consistent API error responses.
 */
export function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}
