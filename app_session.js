var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();

// session init
app.use(session({
  secret: 'asdf!@$##$%^1234',
  resave: false,
  saveUninitialized: true
  //cookie: { secure: true }
}));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// connecting to port
app.listen(3000, function(){
	console.log('Connected, 3000 port!');
});



//conuting session once refreshed the website
app.get('/count', function(req, res){
	if(req.session.count){
		req.session.count++;
	}else{
		req.session.count = 1;
	}	
	res.send('count: ' + req.session.count);
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