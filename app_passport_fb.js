// This project uses a internal system (in a folder)as a session 
// and encyption using md5, sha256, and pbkdf2 methods for securing passwords
// with passport library. This program uses the facebook federation authentication system.
var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
//var md5 = require('md5');
//var sha256 = require('sha256');
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// session init
app.use(session({
  secret: 'asdf!@$##$%^1234',
  resave: false,
  saveUninitialized: true,
  store: new FileStore() // creates session directory 
  //cookie: { secure: true }
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
  for(var i = 0; i < users.length; i++){
	  var user = users[i];
	  if(user.authId === id){
		  return done(null, user);
	  }
  }
  done('There is no user.');
});

passport.use(new LocalStrategy(
	function(username, password, done){
		var uname = username; 
		var pwd = password;
		for (var i=0; i<users.length; i++){
			var user = users[i];
			if (uname === user.username){
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
			}
		}
		done(null,false);
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
	
	for(var i =0; i<users.length; i++){
		var user= users[i];
		if(user.authId === authId){
			return done(null, user);
		}
	}
	var newuser= {
		'authId':authId,
		'displayName':profile.displayName,
		'email': profile.emails[0].value
	};
	users.push(newuser);
	done(null, newuser);
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


// db array
//var salt = '@#$%#@$@#%@#$@#DSEADWQEED!234'; //encryption
var users = [
{
	authId: 'local:youngjae',
	username:'youngjae',
	password:'WjjSKt00GXzfarbQ8c0ubDF5vG6qRc0AkV+mEwPLQTdKHrC5BvxGJW+UyBOoMH1N5YbbOgOMjHW12dSqz3xWMnMCZ0sf4NNq5Ck2QzPvH2bo5gocmTC3r4gjgLS4UvRYS7iwMwgEodq88iJHJKWNFH+QpTKM75xbVOEv7ntWhDI=', 
	salt:'M80sGW/iKhRWPtq17BB3+4duhA6n/FAZ3bDu2H8OqA6b0JQczy+xMCvZINcV/6+WNVq2ttRbzeAeDjOceA416w==',
	displayName:'Youngjae'
},
{
	authId: 'local:duru',
	username:'duru',
	password:'FrdPQskqA1463A4GSk9+OZ9CDm3GwBklY84jCEBMV4v2ObcACe7igBwtDsCbkOFsbVErcyYOAO7RXV6eOYjQzsD53Ic+/cgplbhgnGXXkrvJ3ulosDoAJRxXpaNKzGFno9ya8k//rHl1lOGhy1xkYWH8Jcb5ybOAdJ1ljus70rs=', 
	salt:'knaw/I1R6myWURjA2VFj2QDVKkVdjmSHhj03JEbxWbL+rqJf3VcKWLqaxgPmMtPXplbU7jMnXLktGzA/pibl3w==',
	displayName:'Duru'
}
];

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
		users.push(user); 
		req.login(user, function(err){
			req.session.save(function(){
				res.redirect('/welcome');
			});
		});
		//req.session.displayName = req.body.displayName;
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
			<input type="submit">
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

