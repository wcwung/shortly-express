var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var uuid = require('uuid');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Session = require('./app/models/session');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
// Parses cookies
app.use(cookieParser('yolo5000'));
app.use(express.static(__dirname + '/public'));

app.get('/',
function(req, res) {
  console.log("Cookies ", req.signedCookies);
  // look up uid and session token in the session table
    // if session exists, respond with a new session cookie
    // update the table with the new session cookie
  // send user a new cookie
  // new Session({})

  res.cookie('key', uuid.v4(), { signed: true, maxAge: 900000, httpOnly: true });
  res.render('index');
});

app.get('/create',
function(req, res) {
  res.render('index');
});

app.get('/login',
function(req, res) {
  console.log('login received');
  res.render('index');
});

app.get('/signup',
function(req, res) {
  console.log('signup received');
  res.render('index');
});

app.get('/links',
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.post('/links',
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Signup POST Request
/************************************************************/
app.post('/signup',
  function(req, res) {
    console.log("Signup requested!");
    new User({username: req.body.username})
    .fetch().then(function(found){
      if (found) {
        console.log("Uh oh, user already exists.");
        res.send(404);
      }

      console.log("Write to user table..");
      util.bcryptPassword(req.body.password, function(hash){

        var user = new User({
          username: req.body.username,
          password: hash
        });

        user.save().then(function(newUser){
          Users.add(newUser);
          console.log(user);
          res.send(200, newUser);
        });

      });

    });
});



/************************************************************/
// Write your authentication routes here
/************************************************************/
app.post('/login',
  function(req,res){
    console.log("Login requested!!");

    new User({username: req.body.username})
    .fetch().then(function(model){
      if (!model) {
        return res.send(404);
      }
      util.bcryptCompare(req.body.password, model.get('password'), function(authentication){
        if (authentication) {
          console.log('user is who they say they are');
          // return res.send(200, res.render('index'));
        } else {
          return res.send(404);
        }
      });
      console.log('stored pass', model.get('password'));
      console.log('lookup username in users table', model);
      console.log('the username', model.get('username'));
    });
    // Verify the user is in our users' table
      // if user is not in users' table, we send a 404
      // if they are in the users table, salt user's password and compare with encrypted pass
    // show user their personal links
    // serve session cookies to user
});


/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
