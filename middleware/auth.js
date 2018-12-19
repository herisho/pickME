// ================================= isLogged
function isLogged(req, res, next) {
  var UID = req.session.UID;
  if (UID != undefined || UID != null) {
    next();
  } else {
    res.redirect("/");
  }
}

// ================================= isNotLogged
function isNotLogged(req, res, next) {
  var UID = req.session.UID;
  if (UID != undefined || UID != null) {
    res.redirect("/home");
  } else {
    next();
  }
}

module.exports = {
  isLogged: isLogged,
  isNotLogged: isNotLogged
};
