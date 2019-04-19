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
			res.status(500).send('Internal Server Error:1');
		}
		res.render('new', {topics:files});
	});
});

// moves to updating the contents of a title 
app.get('/update/:id', function(req, res){
	var sql4 = 'select * from topic'; 
	db.query(sql4, function(err, files){
		if(err){
			console.log(err); 
			res.status(500).send('Internal Server Error:5');
		}
		var id = req.params.id; // id is title 
		
		var sql5 = 'SELECT description FROM topic WHERE title=?';
		var desc = '';
		db.query(sql5, [id], function(err, data){
			if(err){
				console.log(err); 
				res.status(500).send('Internal Server Error:6');
			}
		desc = data[0].description;
		res.render('update', {topics:files, title:id, oriTitle:id, description:desc});
		});
	});
});

// updates db with info from user 
app.post('/update/:id', function(req, res){
	var oriTitle = req.body.oriTitle;
	var updatedTitle = req.body.title; 
	var updatedDes = req.body.description;
	console.log('oriTitle: ' + oriTitle); 
	console.log('updatedTitle: ' + updatedTitle); 
	console.log('updatedDes: ' + updatedDes);
	var str = 'UPDATE topic SET title=?, description=?, created=NOW() WHERE title=?'; 
	db.query(str, [updatedTitle, updatedDes, oriTitle], function(err, result){
		if (err){
			console.log(err);
			res.status(500).send('Internal Server Error:7');
		}
		res.redirect('/' + updatedTitle);
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
		console.log('Id: ' + id);
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
				console.log('Description: ' + data[0].description);
				res.render('view', {topics:files, title:id, description:data[0].description});
			});
		}else{
		   // when id does not exists
		   res.render('view', {topics:files, title:'Welcome!', description:'Hello, this is javascript server'});	
		}
	});
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
}); 

app.listen(3000, function(){
	console.log('Connected, 3000 port!');
});
