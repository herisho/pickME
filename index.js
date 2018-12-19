// Dependencies
var os = require("os");
var express = require("express");
var path = require("path");
var pug = require("pug");
var moment = require("moment");

// Routes
var index = require("./routes/index_route");

// Create Express App
var app = express();

// Set Global Response Variables
app.locals.moment = require("moment");

// Static Files Path
app.use(express.static(path.join(__dirname, "public")));

// View Engine Setup
app.engine("pug", require("pug").__express);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Routes Redirection
app.use("/", index);

// Not Found 404
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// Port
var port = 80;
var server = app.listen(port, function() {
  console.log("App running on port " + port + ".");
});
