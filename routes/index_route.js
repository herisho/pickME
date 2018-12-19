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
    // Get updated user.follow
    // var db = admin.database();
    // var ref = db.ref("users/" + req.session.UID);
    // ref.once("value", function(data) {
    //   var user = data.val();
    //   console.log("follow: ", user.follow);
    //   if (user.follow != undefined) {
    //     for (var fol in user.follow) {
    //       if(user.follow[fol] == true)
    //     }
    //   } else {
    //     res.render("home", context);
    //   }
    // });
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
          context.profile.uid = uid;
          context.myprofile = true;
          res.render("profile", context);
        } else {
          // Get updated user.follow
          var db = admin.database();
          var ref = db.ref("users/" + req.session.UID);
          ref.once("value", function(data) {
            var user = data.val();
            console.log("follow: ", user.follow);
            if (user.follow != undefined) {
              if (user.follow[uid] == true) {
                context.follow = true;
              } else {
                context.follow = false;
              }
            } else {
              context.follow = false;
            }
          });
          // Fetch user data
          var usersRef = db.ref("users/" + uid);
          usersRef.once("value", function(data) {
            var user = data.val();
            context.profile = user;
            context.profile.uid = uid;
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
      photosRef.update(photos);
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
  search: function(req, res, next) {
    var name = req.body.search;
    /// Fetch user by name
    var db = admin.database();
    var usersRef = db.ref("users/");
    usersRef
      .orderByChild("name")
      .equalTo(name)
      .once("value", function(usersData) {
        usersData.forEach(function(data) {
          res.redirect("/profile/" + data.key);
        });
      });
  },
  create: function(req, res, next) {
    console.log("Current Session UID =>", req.session.UID);
    var context = {
      title: "pickME | register"
    };
    res.render("register", context);
  },
  follow: function(req, res, next) {
    // follow uid
    var uid = req.params.uid;
    console.log("Following: ", uid);
    var db = admin.database();
    var followRef = db.ref("users/" + req.session.UID + "/follow");
    var update = {};
    update[uid] = true;
    followRef.update(update);

    res.redirect(req.get("referer"));
  },
  unfollow: function(req, res, next) {
    // follow uid
    var uid = req.params.uid;
    console.log("Unfollowing: ", uid);
    var db = admin.database();
    var followRef = db.ref("users/" + req.session.UID + "/follow");
    var update = {};
    update[uid] = false;
    followRef.update(update);

    res.redirect(req.get("referer"));
  }
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
router.get("/follow/:uid", auth.isLogged, userController.follow);
router.get("/unfollow/:uid", auth.isLogged, userController.unfollow);
router.post("/search", auth.isLogged, userController.search);

// photoController
router.get("/set-photos", auth.isLogged, photoController.insert);

// IG Auth
router.get("/igAuth", auth.isLogged, loginController.igAuth);
router.get("/igAuthCallback", auth.isLogged, loginController.igAuthCallback);

module.exports = router;
