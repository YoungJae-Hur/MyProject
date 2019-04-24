// this project uses a file system as a session
var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
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


// connecting to port
app.listen(3000, function(){
	console.log('Connected, 3000 port!');
});




app.get('/tmp', function(req, res){
	res.send('result: ' + req.session.count);
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
	`;
	res.send(output);
});

app.post('/auth/login', function(req, res){
	// db array
	var user = {
		username:'youngjae',
		password:'1111',
		displayName:'Youngjae'
	};
	var uname = req.body.username; 
	var pwd = req.body.password;
	if(uname === user.username && pwd === user.password){
		req.session.displayName = user.displayName; // svae the id in the session server
		res.redirect('/welcome');
		//res.send('Hello, ' + uname + '!');
	}else{
		res.send(`Wrong username or password. Try again or click Forgit password to reset it.<p><a href="/auth/login">login page</a></p>
		`);
	}
});

app.get('/welcome', function(req, res){
	if(req.session.displayName){
		res.send(`
			<h1>Hello, ${req.session.displayName}</h1>
			<a href="/auth/logout">logout</a>
		`);
	}else{
		res.send(`
			<h1>Welcome</h1>
			<a href=/auth/login>Login</a>
		`);
	}
});

app.get('/auth/logout', function(req, res){
	delete req.session.displayName;
	res.redirect('/welcome');
});