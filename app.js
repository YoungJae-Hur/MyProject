var express = require('express');
var app = express();
app.locals.pretty = true;
app.set('view engine', 'jade');
app.set('views', './views');
app.use(express.static('public'));

app.get('/topic', function(req, res){
	var topics = [
		'Javascript is...',
		'NodeJs is...',
		'Express is...'
	];	
	var output = `
	<a href="/topic?id=0">JavaScript</a><br>
	<a href="/topic?id=1">NodeJs</a><br>
	<a href="/topic?id=2">Express</a><br><br>
	${topics[req.query.id]}
	`;
	res.send(output);
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
