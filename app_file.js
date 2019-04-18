var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var mysql = require('mysql'); 

//connecting to MySQL 
var db = mysql.createConnection({
	host: 'localhost', 
	user: 'root',
	password: '111111',
	database: 'opentutorials'
});
db.connect();

//Makes the html code pretty (= make a line)
app.locals.pretty = true;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//declare template engines with express 
app.set('views', './views_file');
app.set('view engine', 'jade');

app.get('/new', function(req, res){
	//fs.readdir('data', function(err, files){
	var sql3 = 'select * from topic';
	db.query(sql3, function(err, files){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error1');
		}
		res.render('new', {topics:files});
	});
	//});
});

// Updates the contents of a title 
app.get('/update/:id', function(req, res){
	var sql4 = 'select * from topic'; 
	db.query(sql4, function(err, files){
		if(err){
			console.log(err); 
			res.status(500).send('Internal Server Error5');
		}
		var id = req.params.id; // id is title 
		
		var sql5 = '';
		//db.query(sql5, [], function(err, data){
		//	if(err){
		//		console.log(err); 
		//		res.status(500).send('Internal Server Error6');
		//	}
		res.render('update', {topics:files, title:'Let"s modify!', description:'First, choose the title to modify'});
		//});
	});
});
	

app.get(['/', '/:id'], function(req, res){
	//fs.readdir('data', function(err, files){
	var sql1 = 'select * from topic'; 
	db.query(sql1, function(err, files){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error2');
		}
		var id = req.params.id; // id is title 
		//debug purpose 
		console.log('id: ' + id);
		if(id){
		   // when id exists
		   //fs.readFile('data/'+id, 'utf8', function(err, data){
			var sql2 = 'SELECT description from topic WHERE title=?';
			db.query(sql2,[id],function(err, data){
				if(err){
					console.log(err);
					res.status(500).send('Internal Server Error3');
				}
				//debug purpose
				console.log('description: ' + data[0].description);
				res.render('view', {topics:files, title:id, description:data[0].description});
			});
				
			//});
		}else{
		   // when id does not exists
		   res.render('view', {topics:files, title:'Welcome!', description:'Hello, this is javascript server'});	
		}
	});
	//});	
});

//app.get('/topic/:id', function(req, res){
//	var id = req.params.id;
//	fs.readdir('data', function(err, files){
//		if(err){
//			console.log(err);
//			res.status(500).send('Internal Server Error');
//		}
//		
//		fs.readFile('data/'+id, 'utf8', function(err, data){
//		if(err){
//			console.log(err);
//			res.status(500).send('Internal Server Error');
//		}
//		res.render('view', {topics:files, title:id, description:data});
//		});		
//	});		
//});

app.post('/', function(req, res){
	var title = req.body.title;
	var description = req.body.description; 
	//fs.writeFile('data/' + title, description, function(err){
	var insertStr = 'INSERT INTO topic (title, description, created, author_id) VALUES (?,?,NOW(),?)';
	db.query(insertStr,[title, description, 'NOW()',1], function(err, result){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error4');
		}
		//making files (fileSystem)
		//res.send('File is created!');
		res.redirect('/'+title);
	});
	//});	
}); 

app.listen(3000, function(){
	console.log('Connected, 3000 port!');
});

