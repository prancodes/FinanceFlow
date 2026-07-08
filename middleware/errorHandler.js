const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', err);

  // Handle expired/tampered session encryption keys gracefully
  if (err.message && err.message.includes("Encrypted session was tampered with")) {
    res.clearCookie("connect.sid");
    res.clearCookie("token");
    res.clearCookie("isLoggedIn");

    if (req.headers.accept && req.headers.accept.includes("text/html")) {
      return res.redirect("/login");
    }

    return res.status(401).json({
      error: "Session expired or invalid. Please login again.",
      message: "Session expired or invalid. Please login again."
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred. Please try again later.';

  res.status(statusCode).json({
    error: message,
    message: message
  });
};

export default errorHandler;