var firebase = require('firebase');
  require('firebase/auth');
  require('firebase/database');

// Initialize Firebase for the application
var config = {
  apiKey: "AIzaSyACT9N3NFxO2pKdloRP_nEK7sajPPLIMmU",
  authDomain: "pickme-brounie-eval.firebaseapp.com",
  databaseURL: "https://pickme-brounie-eval.firebaseio.com",
  projectId: "pickme-brounie-eval",
  storageBucket: "pickme-brounie-eval.appspot.com",
  messagingSenderId: "270154486543"
};
firebase.initializeApp(config); 

// ================================= isLogged
function isLogged(req, res, next) {
  var user = firebase.auth().currentUser;
  if (user !== null) {
    req.user = user;
    next();
  } else {
    res.redirect('/');
  }
}
function isNotLogged(req, res, next) {
  var user = firebase.auth().currentUser;
  if (user !== null) {
    req.user = user;
    res.redirect('/home');
  } else {
    next();
  }
}

module.exports = {
  isLogged: isLogged,
  isNotLogged: isNotLogged
};
