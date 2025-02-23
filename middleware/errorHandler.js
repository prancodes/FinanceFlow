const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred. Please try again later.';

  res.status(statusCode).json({
    error: message
  });
};

export default errorHandler;