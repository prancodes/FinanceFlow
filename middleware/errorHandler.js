const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error('Error occurred:', err);

  // Handle expired/tampered/corrupted session encryption keys gracefully
  const isSessionError = err.message && (
    err.message.includes("Encrypted session was tampered with") ||
    err.message.includes("is not valid JSON") ||
    err.message.includes("Unexpected token") ||
    err.message.includes("decrypt") ||
    err.message.includes("ciphertext") ||
    err.message.includes("complexity requirements")
  );

  if (isSessionError) {
    res.clearCookie("connect.sid");
    res.clearCookie("token");
    res.clearCookie("isLoggedIn");

    if (req.headers.accept && req.headers.accept.includes("text/html")) {
      return res.redirect("/login");
    }

    return res.status(401).json({
      error: "Session expired or invalid. Please login again.",
      message: "Session expired or invalid. Please login again.",
    });
  }

  const statusCode = err.statusCode || 500;
  const message =
    err.message || "An unexpected error occurred. Please try again later.";

  res.status(statusCode).json({
    error: message,
    message: message,
  });
};

export default errorHandler;
