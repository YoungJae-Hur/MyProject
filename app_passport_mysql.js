// This project uses mysql database system to store session information and user data. 
// To secure passwords, encyption methodologies such as md5, sha256, and pbkdf2 are applied.
// With the passport library, this program uses the facebook federation authentication system.
// working date: 04-27-19
var express = require('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser');
//var md5 = require('md5');
//var sha256 = require('sha256');
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var app = express();

// mysql library
var mysql = require('mysql');
var db = mysql.createConnection({
  host: 'localhost', 
  user: 'root',
  password: '111111',
  database: 'o2'
});
db.connect();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// session init
app.use(session({
  secret: 'asdf!@$##$%^1234',
  resave: false,
  saveUninitialized: true,
  store: new MySQLStore({
	    host: 'localhost',
		port: 3306,
		user: 'root',
		password: '111111',
		database: 'o2'
  }) // creates mysql db session
}));

// for passport 
app.use(passport.initialize());
app.use(passport.session()); // has to be located after session init function above^

//conuting session once refreshed the website
app.get('/count', function(req, res){
	if(req.session.count){
		req.session.count++;
	}else{
		req.session.count = 1;
	}	
	res.send('count: ' + req.session.count);
});

app.get('/auth/logout', function(req, res){
	req.logout();
	//delete req.session.displayName;
	req.session.save(function(){
		res.redirect('/welcome');
	});
});

app.get('/welcome', function(req, res){
	if(req.user && req.user.displayName){
		res.send(`
			<h1>Hello, ${req.user.displayName}</h1>
			<a href="/auth/logout">logout</a>
		`);
	}else{
		res.send(`
			<h1>Welcome</h1>
				<ul>
					<li><a href=/auth/login>Login</a></li>
					<li><a href=/auth/register>Register</a></li>
				</ul>
		`);
	}
});

passport.serializeUser(function(user, done) { //세션에 등록 
  console.log('serializeUser: ', user);
  done(null, user.authId); // 두번째 인자는 user 테이블의 username 값을 준다.
});

passport.deserializeUser(function(id, done) {
  console.log('deserializeUser: ', id);
	var sql = 'SELECT * FROM users WHERE authId=?';
	db.query(sql, [id], function(err, results){
		if(err){
			console.log('error(1): deserializeUser' + err);
			done('There is no user.');
		}else{
			done(null, results[0]);
		}
	});
});

passport.use(new LocalStrategy(
	function(username, password, done){
		var uname = username; 
		var pwd = password;
		var sql = 'SELECT * FROM users WHERE authId=?';
		db.query(sql, ['local:'+uname], function(err, results){
			console.log(results);
			if (err){
				return done('There is no user.');
			}
			var user = results[0];
			return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
				// debug purpose
				//console.log('username: ' + uname + ' pass: '+ pass + ' hash: ' + hash);
				if(hash === user.password){
					console.log('LocalStrategy: ', user);
					done(null, user); // login process is suceeded
				}else{
					done(null, false, {message: 'Incorrect username'}); //login process is failed 
				}
			});
		});
	}
));

passport.use(new FacebookStrategy({
    clientID: '455791268323359',
    clientSecret: '27458f28234c79e77f803f05f0d62ad1',
    callbackURL: "https://nodejs-features.run.goorm.io/auth/facebook/callback", //'/auth/facebook/callback' 
	profileFields:['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName']
  },
  function(accessToken, refreshToken, profile, done) {
	console.log('profile: ', profile);
	var authId = 'facebook:'+profile.id;
	
	var sql = 'SELECT * FROM users WHERE authId=?';
	db.query(sql, [authId], function(err, results){
		if(results.length>0){
			done(null, results[0]);
		}else{
			var newuser= {
				'authId':authId,
				'displayName':profile.displayName,
				'email': profile.emails[0].value
			};
			var sql = 'INSERT INTO users SET ?';
			db.query(sql, newuser, function(err, results){
				if(err){
					console.log('error(1): FacebookStrategy' + err);
					done('Error!');
				}else{
					done(null, newuser);
				}
			});
		}
	});
  }
));

app.post(
	'/auth/login', 
	passport.authenticate(
		'local', 
		{
			successRedirect: '/welcome',
            failureRedirect: '/auth/login',
            failureFlash: false 
		}
	)
);

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook', {scope:'email'}));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/welcome',
                                      failureRedirect: '/auth/login' }));
// this is a function that registers 
app.post('/auth/register', function(req, res){
	hasher({password:req.body.password}, function(err, pass, salt, hash){
		var user = {
			authId: 'local:' + req.body.username,
			username:req.body.username,
			password:hash,
			salt:salt,
			displayName:req.body.displayName
		};
		var sql = 'INSERT INTO users SET ?';
		db.query(sql, user, function(err,results){
			if(err){
				console.log('error(1): /auth/register' + err);
				res.status(500);
			}else{
				req.login(user, function(err){ // register and immediately logged in status
					req.session.save(function(){
						res.redirect('/welcome');
					});
				});
				//req.session.displayName = req.body.displayName;
				//res.redirect('/welcome');
			}
		});
		
	});
});
app.get('/auth/register', function(req, res){
	var output=`
	<h1>Register</h1>
	<form action="/auth/register" method="post">
		<p>
			<input type="text" name="username" placeholder="username">
		</p>
		<p>
			<input type="password" name="password" placeholder="password">
		</p>
		<p>
			<input type="text" name="displayName" placeholder="displayName">
		</p>
		<p>
			<input type="submit">
		</p>
	</form>
	`;
	res.send(output);
});

//login function
app.get('/auth/login', function(req, res){
	var output = `
	<h1>Login</h1>
	<form action="/auth/login" method="post">
		<p>
			<input type="text" name="username" placeholder="username">
		</p>
		<p>
			<input type="password" name="password" placeholder="password">
		</p>
		<p>
			<input type="submit" value="Submit">
		</p>
	</form>
	<a href="/auth/facebook">Login with Facebook</a>
	`;
	res.send(output);
});

// This is just a temp url for facebook developer private_policy setting
app.get('/auth/private_policy', function(req, res){
	res.send('This is private policy');
});

// connecting to port
app.listen(3000, function(){
	console.log('Connected, 3000 port!');
});

//this is just a temporary function
app.get('/tmp', function(req, res){
	res.send('result: ' + req.session.count);
});

