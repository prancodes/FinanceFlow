// Middleware to check if user is authenticated
function isLoggedIn(req, res, next) {
  if (req.session.userId) {
    return next();
  } else {
    res.redirect('/login');
  }
}

export default isLoggedIn;