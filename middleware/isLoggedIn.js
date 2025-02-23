export default function isLoggedIn(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.redirect('/login');
  }
}