
/**
 * Middleware for handling errors in API requests
 */
const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

export default errorHandler;
