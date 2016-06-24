var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('blog_database');


var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

app.post('/register', function(req, res){
  res.contentType('json');
  if(req.body.username && req.body.password) {
    db.serialize(function() {
      db.each('SELECT * FROM Users WHERE username = "'+req.body.username+'";', function(err, row) {
        if(err) 
          console.log("Error:" +  err);
        else {
          res.send({ error: 'User Already Exists'});
        }
      }, function(err, rows) {
        if (rows == 0) {
          console.log("Creating User");
          db.run("INSERT INTO Users (username, password, firstname, lastname, lastActive, userIcon) VALUES (?,?,?,?,?,?)", req.body.username, req.body.password, req.body.firstname, req.body.lastname, new Date(), "default.gif");
          db.each('SELECT uId FROM Users WHERE username = "'+req.body.username+'";', function(err, row) {
            if(err) 
              console.log("Error:" +  err);
            else {
              res.send({ success: 'User Created', userId: row.uId});
            }
          });
        }
      });
    });
 
  } else {
    res.send({ error: 'Somethign went wrong'});
  }
});

app.post('/deletePost', function(req, res) {
  res.contentType('json');
  db.serialize(function() {
    db.run("DELETE FROM Blog WHERE pId="+req.body.postId+";");
    res.send({success:"blog deleted"});
  });
});

app.post('/updatePost', function(req, res) {
  res.contentType('json');
  db.serialize(function() {
    db.each('SELECT * FROM Blog WHERE pId = "'+req.body.postId+'";', function(err, row) 
	{
        if(err) console.log("Error:" +  err);
        else {
          res.send({ title: row.title, content: row.content});
        }
	});
	});
});

app.post('/signin', function(req, res){
  res.contentType('json');
  if(req.body.username && req.body.password) {
    db.serialize(function() {
      db.each('SELECT * FROM Users WHERE username = "'+req.body.username+'" AND password = "'+req.body.password+'";', function(err, row) {
        if(err) console.log("Error:" +  err);
        if(typeof row == "undefined") {
          res.send({ error: 'Incorrect Credentials'});
        } else {
          console.log("row is: ", row);
           res.send({ success: 'User Authenticated', userId: row.uId, fullname:row.firstname +" "+ row.lastname});
        }
      }, function(err, rows) {
        if (rows == 0) {
          res.send({ error: 'Incorrect Credentials'});
        }
      });
    });
 
  } else {
    res.send({ error: 'Login Failed'});
  }
});

app.post('/updateblog', function(req, res){
  res.contentType('json');
  if(req.body.title && req.body.content) 
  {
    db.serialize(function() {
    //db.run('UPDATE Blog SET title = "'+req.body.title+'", content = "'+req.body.content+'" WHERE pId='+req.body.PostId+';');
	db.run("UPDATE Blog SET title = ?, content = ? WHERE pId=?", req.body.title, req.body.content, req.body.PostId);
	res.send({success:"blog updated"});
  });
}
});

app.post('/blogpost', function(req, res){
  res.contentType('json');
  if(req.body.title && req.body.content) {
    db.serialize(function() {
      db.each('SELECT * FROM Blog WHERE title = "'+req.body.title+'";', function(err, row) {
        if(err) 
          console.log("Error:" +  err);
        else {
          res.send({ error: 'Title Already Exists. No duplicates allowed!'});
        }
      }, function(err, rows) {
        if (rows == 0) {
          console.log("Creating Post");
          db.run("INSERT INTO Blog (title, content, postedBy, timePosted) VALUES (?,?,?,?)", req.body.title, req.body.content, req.body.postedBy, new Date());
          res.send({ success: 'Post Created'});
        }
      });
    });
 
  } else {
    res.send({ error: 'Something went wrong'});
  }
});

app.get('/allPosts', function(req, res) {
  res.contentType('json');
  var posts = [];
  db.serialize(function() {
    db.each('SELECT Blog.*, Users.* FROM Blog INNER JOIN Users ON Blog.postedBy=Users.uId ORDER BY pId DESC;', function(err, row) {
      if(err) 
        console.log("Error:" +  err);
      else {
        var post = {};
		post.pId = row.pId;
        post.title = row.title;
        post.content = row.content;
		post.uId = row.uId;
		post.username = row.firstname +" "+ row.lastname;
        var date = new Date(row.timePosted);
        post.timePosted = date.toDateString();
        
		
		posts.push(post);
      }
    }, function(err, rows) {
      res.send({ allPosts: posts});
    });
  });

});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

//Create SQLite Database Table
db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS Users (uId INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL,password TEXT NOT NULL, firstname TEXT NOT NULL, lastname TEXT NOT NULL, lastActive DATETIME NOT NULL, userIcon TEXT NOT NULL);");
  db.run("CREATE TABLE IF NOT EXISTS Blog (pId INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL,content TEXT NOT NULL, postedBy INTEGER NOT NULL, timePosted DATETIME NOT NULL);");
});
