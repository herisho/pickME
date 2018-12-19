var express = require("express");
// var moment = require("moment");
var ig = require('instagram-node').instagram();
var router = express.Router();

var auth = require("../middleware/auth");
var keys = require("../config/keys");
// var firebase = require('firebase');
//   require('firebase/auth');
//   require('firebase/database');

// // Initialize Firebase for the application
// var config = {
//   apiKey: "AIzaSyACT9N3NFxO2pKdloRP_nEK7sajPPLIMmU",
//   authDomain: "pickme-brounie-eval.firebaseapp.com",
//   databaseURL: "https://pickme-brounie-eval.firebaseio.com",
//   projectId: "pickme-brounie-eval",
//   storageBucket: "pickme-brounie-eval.appspot.com",
//   messagingSenderId: "270154486543"
// };
// firebase.initializeApp(config); 

// Config Instagram API
ig.use({
  client_id: keys.igClientID,
  client_secret: keys.igClientSecret
});
var igCallbackURI = 'http://localhost:8080/authCallback';

var mainController = {
  index: function(req, res, next) {
    var context = {
      title: "pickME | home",
    };
    res.render("home", context);
  },
  home: function(req, res, next) {
    ig.use({
    access_token : accessToken
    });
  
    ig.user_media_recent(accessToken.split('.')[0], function(err, result, pagination, remaining, limit) {
      if(err) {
        console.log('error => ',err);
        res.send(err.body);
      }
      console.log('result => ',result);
      res.render('index', { pictures : result });
    });
  },
  profile: function(req, res, next) {

  }
}

var loginController = {
  index: function(req, res, next) {
    var context = {
      title: "pickME | login",
    };
    res.render("login", context);
  },
  login: function(req, res, next) {

  },
  logout: function(req, res, next){
    
  },
  igAuth: function(req, res, next){
    res.redirect(ig.get_authorization_url(igCallbackURI, { scope : ['public_content','likes']}) );
  },
  igAuthCallback: function(req, res, next){
    ig.authorize_user(req.query.code, igCallbackURI, function(err, result){
      if(err) res.send( err );
      // console.log('accessToken on "callback" => ', result.access_token);
      accessToken = result.access_token;
      res.redirect('/');
    });    
  },
}

var userController = {
  create: function(req, res, next) {
    var context = {
      title: "pickME | register",
    };
    res.render("register", context);

  },
  insert: function(req, res, next) {

  },
  update: function(req, res, next) {

  },
}

// loginController
router.get('/', auth.isNotLogged, loginController.index);

// mainController
router.get('/home', auth.isLogged, mainController.index);

// userController
router.get('/register', auth.isNotLogged, userController.create);

// IG Auth
router.get('/igAuth', auth.isLogged, loginController.igAuth);
router.get('/igAuthCallback', auth.isLogged, loginController.igAuthCallback);

module.exports = router;
