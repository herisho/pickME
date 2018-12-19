var express = require("express");
// var moment = require("moment");
var ig = require("instagram-node").instagram();
var router = express.Router();
var admin = require("firebase-admin");
var auth = require("../middleware/auth");

var keys = require("../config/keys");
var serviceAccount = require("../middleware/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pickme-brounie-eval.firebaseio.com"
});

ig.use({
  client_id: keys.igClientID,
  client_secret: keys.igClientSecret
});
var igCallbackURI = "http://localhost:8080/authCallback";

var mainController = {
  index: function(req, res, next) {
    var context = {
      title: "pickME | home"
    };
    res.render("home", context);
  },
  home: function(req, res, next) {
    ig.use({
      access_token: accessToken
    });

    ig.user_media_recent(accessToken.split(".")[0], function(
      err,
      result,
      pagination,
      remaining,
      limit
    ) {
      if (err) {
        console.log("error => ", err);
        res.send(err.body);
      }
      console.log("result => ", result);
      res.render("index", { pictures: result });
    });
  },
  profile: function(req, res, next) {}
};

var loginController = {
  index: function(req, res, next) {
    console.log("Current Session UID =>", req.session.UID);
    var context = {
      title: "pickME | login"
    };
    res.render("login", context);
  },
  login: function(req, res, next) {
    var idToken = req.body.idToken;
    admin
      .auth()
      .verifyIdToken(idToken)
      .then(function(decodedToken) {
        var uid = decodedToken.uid;
        console.log("Obtained UID...");
        // console.log("uid =>", uid);
        req.session.UID = uid;
        console.log("uid =>", req.session.UID);
        res.send(200);
      })
      .catch(function(error) {
        res.send(401);
      });
  },
  logout: function(req, res, next) {
    req.session.UID = null;
    res.redirect("/");
  },
  igAuth: function(req, res, next) {
    res.redirect(
      ig.get_authorization_url(igCallbackURI, {
        scope: ["public_content", "likes"]
      })
    );
  },
  igAuthCallback: function(req, res, next) {
    ig.authorize_user(req.query.code, igCallbackURI, function(err, result) {
      if (err) res.send(err);
      // console.log('accessToken on "callback" => ', result.access_token);
      accessToken = result.access_token;
      res.redirect("/");
    });
  }
};

var userController = {
  create: function(req, res, next) {
    console.log("Current Session UID =>", req.session.UID);
    var context = {
      title: "pickME | register"
    };
    res.render("register", context);
  },
  insert: function(req, res, next) {},
  update: function(req, res, next) {}
};

// loginController
router.get("/", auth.isNotLogged, loginController.index);
router.post("/login", auth.isNotLogged, loginController.login);
router.get("/logout", auth.isLogged, loginController.logout);

// mainController
router.get("/home", auth.isLogged, mainController.index);

// userController
router.get("/register", auth.isNotLogged, userController.create);

// IG Auth
router.get("/igAuth", loginController.igAuth);
router.get("/igAuthCallback", loginController.igAuthCallback);

module.exports = router;
