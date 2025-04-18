export default function isLoggedIn(req, res, next) {
  if ((req.session && req.session.userId)|| req.session.isGuest) {
    return next();
  } else {
    return res.redirect('/login');
  }
}