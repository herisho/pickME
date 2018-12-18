// Dependencies
var os  = require('os');
var express = require('express');
var ig = require('instagram-node').instagram();
var path = require("path");
var pug = require("pug");

// Create Express App
var app = express();

// Set Global Response Variables
// app.locals.moment = require("moment");

// Static Files Path
app.use(express.static(path.join(__dirname, "public")));

// Routes
// app.use("/", platform);

// View Engine Setup
app.engine('pug', require('pug').__express)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Config Instagram API
ig.use({
  client_id: '2cd05f612b43472baca49b9c98219fe5',
  client_secret: 'a43d8d60f3c5400cb63897656d9aab2a'
});
var igCallbackURI = 'http://localhost:8080/authCallback';

app.get('/login', function(req, res){
  res.redirect(ig.get_authorization_url(igCallbackURI, { scope : ['public_content','likes']}) );
});

app.get('/authCallback', function(req, res){
  ig.authorize_user(req.query.code, igCallbackURI, function(err, result){
    if(err) res.send( err );
    console.log('accessToken on "callback" => ', result.access_token);
    accessToken = result.access_token;
    res.redirect('/');
  });
});

app.get('/', function(req, res){
  // console.log('accessToken on "\\" => ', accessToken);
  ig.use({
  access_token : accessToken
  });

  ig.user_media_recent(accessToken.split('.')[0], function(err, result, pagination, remaining, limit) {
    if(err) {
      console.log('error => ',err);
      res.send(err.body);
    }
    // console.log('result => ',result)
    res.render('index', { pictures : result });
  });
});

app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// Port
var port = 8080;
var server = app.listen(port, function() {
    console.log('App running on port ' + port + '.');
});
