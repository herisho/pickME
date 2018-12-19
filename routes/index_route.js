var express = require("express");
// var moment = require("moment");
var ig = require("instagram-node").instagram();
var router = express.Router();

var keys = require("../config/keys");
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
    var context = {
      title: "pickME | login"
    };
    res.render("login", context);
  },
  login: function(req, res, next) {},
  logout: function(req, res, next) {},
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
    var context = {
      title: "pickME | register"
    };
    res.render("register", context);
  },
  insert: function(req, res, next) {},
  update: function(req, res, next) {}
};

// loginController
router.get("/", loginController.index);

// mainController
router.get("/home", mainController.index);

// userController
router.get("/register", userController.create);

// IG Auth
router.get("/igAuth", loginController.igAuth);
router.get("/igAuthCallback", loginController.igAuthCallback);

module.exports = router;
