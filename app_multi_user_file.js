// this project uses a file system as a session and encyption using md5 for password
var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var md5 = require('md5');
var sha256 = require('sha256');
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
	delete req.session.displayName;
	res.redirect('/welcome');
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
				<ul>
					<li><a href=/auth/login>Login</a></li>
					<li><a href=/auth/register>Register</a></li>
				</ul>
		`);
	}
});

app.post('/auth/login', function(req, res){
	var uname = req.body.username; 
	var pwd = req.body.password;
	for (var i =0; i <users.length; i++){
		var user = users[i];
		if(uname === user.username && sha256(pwd + user.salt) === user.password){
			req.session.displayName = user.displayName; // svae the id in the session server
			return req.session.save(function(){
				res.redirect('/welcome');
			});
		}
	}
	res.send(`Wrong username or password. Try again or click Forgit password to reset it.<p><a href="/auth/login">login page</a></p>
	`);
});
// db array
//var salt = '@#$%#@$@#%@#$@#DSEADWQEED!234'; //encryption
var users = [
{
	username:'youngjae',
	password:'c525a90bcdc19b9b08c975678cf199465644b00e82e743d7abd0526832416855', 
	salt:'!@#$%qwer1234',
	displayName:'Youngjae'
},
{
	username:'duru',
	password:'f920251e188b17d3355be29465a15678fa2866ec20e0df0aa1ce37f38e2dcfce', 
	salt:'7890@#$%$%^&',
	displayName:'Duru'
}
];

app.post('/auth/register', function(req, res){
	var user = {
		username:req.body.username,
		password:req.body.password,
		displayName:req.body.displayName
	};
	users.push(user); 
	req.session.displayName = req.body.displayName;
	req.session.save(function(){
		res.redirect('/welcome');
	});
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

// connecting to port
app.listen(3000, function(){
	console.log('Connected, 3000 port!');
});


app.get('/tmp', function(req, res){
	res.send('result: ' + req.session.count);
});

