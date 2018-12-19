// Firebase as Middleware
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://pickme-brounie-eval.firebaseio.com"
});

// ================================= isLogged
function isLogged(req, res, next) {
  const authorization = req.header('Authorization');
  if (authorization) {
      admin.auth().verifyIdToken(authorization)
      .then((decodedToken) => {
          console.log(decodedToken); //Check decoding
          res.locals.user = decodedToken;
          next();
      })
      .catch(err => {
          console.log(err);
          // res.sendStatus(401);
          res.redirect('/');
      });
  } else {
      console.log('Authorization header is not found');
      // res.sendStatus(401);
      res.redirect('/');
  }
}

// ================================= isNotLogged
function isNotLogged(req, res, next) {
  const authorization = req.header('Authorization');
  if (authorization) {
      admin.auth().verifyIdToken(authorization)
      .then((decodedToken) => {
          console.log(decodedToken); //Check decoding
          res.locals.user = decodedToken;
          res.redirect('/home');
      })
      .catch(err => {
          console.log(err);
          // res.sendStatus(401);
          next();
      });
  } else {
      console.log('Authorization header is not found');
      // res.sendStatus(401);
      next();
  }
}

module.exports = {
  isLogged: isLogged,
  isNotLogged: isNotLogged
};
