// this projects demos the route concept of the nodejs
var express = require('express');
var app = express();

var p1 = require('./routes/p1'); // gets the data from p1.js from routes directory
app.use('/p1', p1);

var p2 = require('./routes/p2'); // same idea from the above 
app.use('/p2', p2);

app.listen(3000, function(){
	console.log('Connected 3000 port!');
});