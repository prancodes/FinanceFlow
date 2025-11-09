const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred. Please try again later.';

  res.status(statusCode).json({
    error: message,
    message: message
  });
};

export default errorHandler;