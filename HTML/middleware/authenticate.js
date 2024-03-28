function authenticate(req, res, next) {
  if (req.session && req.session.userId ) {
    next(); // Proceed if the session is valid
  } else {
    res.redirect('login.html'); // Redirect to login page if not authenticated
  }
}

module.exports = authenticate;