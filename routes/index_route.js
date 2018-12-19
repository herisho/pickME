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
var igCallbackURI = "http://localhost:80/igAuthCallback";

var mainController = {
  index: function(req, res, next) {
    var context = {
      title: "pickME | home",
      session: req.session
    };
    res.render("home", context);
  },
  profile: function(req, res, next) {
    var context = {
      title: "pickME | profile",
      session: req.session
    };
    var uid = req.params.uid;
    // Fetch user photos
    var db = admin.database();
    var photosRef = db.ref("photos/");
    var photos = [];
    photosRef
      .orderByChild("createdBy")
      .equalTo(uid)
      .once("value", function(photosData) {
        photosData.forEach(function(data) {
          var photo = data.val();
          photos.push(photo);
        });
      })
      .then(function() {
        context.photos = photos;
        if (uid == req.session.UID) {
          context.profile = req.session.user;
          context.myprofile = true;
          res.render("profile", context);
        } else {
          // Fetch user data
          var usersRef = db.ref("users/" + uid);
          usersRef.once("value", function(data) {
            var user = data.val();
            context.profile = user;
            context.myprofile = false;
            res.render("profile", context);
          });
        }
      });
  }
};

var photoController = {
  insert: function(req, res, next) {
    // Insert photos to DB
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
      var photos = {};
      result.forEach(function(picture) {
        photos[picture.id] = {
          src: picture.images.standard_resolution.url,
          link: picture.link,
          caption: picture.caption.text,
          createdAt: picture.created_time,
          createdBy: req.session.UID
        };
      });
      var db = admin.database();
      var photosRef = db.ref("photos/");
      photosRef.set(photos);
      res.redirect("/profile/" + req.session.UID);
      // console.log("result => ", result);
      // context.photos = result;
      // res.render("index", context);
    });
  }
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

        // Get user data
        var db = admin.database();
        var ref = db.ref("users/" + uid);
        ref.once("value", function(data) {
          var user = data.val();
          req.session.UID = data.key;
          req.session.user = user;
        });

        // Get all contacts
        var ref = db.ref("users/");
        var contacts = [];
        // Fetch once
        ref
          .once("value", function(usersData) {
            console.log("Fetched data...");
            usersData.forEach(function(data) {
              var user = data.val();
              // console.log("userId =>", data.key);
              // console.log("user =>", user);
              contacts.push(user.name);
            });
          })
          .then(function() {
            req.session.contacts = contacts;
            console.log("contacts =>", req.session.contacts);
            res.sendStatus(200);
          });
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
      res.redirect("/set-photos");
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
router.get("/profile/:uid", auth.isLogged, mainController.profile);

// userController
router.get("/register", auth.isNotLogged, userController.create);

// photoController
router.get("/set-photos", auth.isLogged, photoController.insert);

// IG Auth
router.get("/igAuth", loginController.igAuth);
router.get("/igAuthCallback", loginController.igAuthCallback);

module.exports = router;
