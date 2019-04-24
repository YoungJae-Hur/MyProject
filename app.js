var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.locals.pretty = true;
app.set('view engine', 'jade');
app.set('views', './views');
app.use(express.static('public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//getting info using POST with a form
app.get('/form', function(req, res){
	res.render('form');
});

// creates a router for form_receiver (w/ get method)
app.get('/form_receiver', function(req, res){
	var title = req.query.title;
	var description = req.query.description;
	
	res.send(title+', '+description);
});
// (post method)
app.post('/form_receiver', function(req, res){
	var title = req.body.title;
	var description = req.body.description; 	
	res.send(title+', '+description);
});

//URL query string
app.get('/topic/:id', function(req, res){
	var topics = [
		'Javascript is...',
		'NodeJs is...',
		'Express is...'
	];	
	var output = `
	<a href="/topic?id=0">JavaScript</a><br>
	<a href="/topic?id=1">NodeJs</a><br>
	<a href="/topic?id=2">Express</a><br><br>
	${topics[req.params.id]}
	`;
	res.send(output);
});

//semantic URL
app.get('/topic/:id/:mode', function(req, res){
	res.send(req.params.id + ',' + req.params.mode);
});

app.get('/template', function(req, res){
	res.render('temp', {time:Date(), _title:'YJs NodeJs'});
});
app.get('/', function(req, res){
	res.send('Hello home page');
});

app.get('/dynamic', function(req, res){
	var lis = ''; 
	for (var i = 0; i<5; i++){
		lis = lis + '<li>coding</li>'; 
	}
	var time = Date();
	var output = `
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title></title>
	</head>
	<body>
		Hello, Dynamic!
		<ul>
			${lis}
		</ul>
		Current Time: ${time}
	</body>
</html>`;
	res.send(output);
}); 
app.get('/route', function(req, res){
	res.send('Hello Router, <img src="/Lighthouse.png">');
});

app.get('/login', function(req, res){
	res.send('<h1>Please Login</h1>');
});
app.listen(3000, function(){
	console.log('Connected port 3000!');
});
