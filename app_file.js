var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var mysql = require('mysql'); 
//var popupS = require('popups');
//var JSAlert = require("js-alert");

//connecting to MySQL 
var db = mysql.createConnection({
	host: 'localhost', 
	user: 'root',
	password: '111111',
	database: 'opentutorials'
});
db.connect();

// connecting to port
app.listen(3000, function(){
	console.log('Connected, 3000 port!');
});

//Makes the html code pretty (= make a line)
app.locals.pretty = true;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//declare template engines with express 
app.set('views', './views_file');
app.set('view engine', 'jade');

// creates a new title
app.get('/new', function(req, res){
	//fs.readdir('data', function(err, files){
	var sql3 = 'select * from topic';
	db.query(sql3, function(err, files){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error(new):1');
		}
		db.query('select * from author', function(err, authors){
			if(err){
				console.log(err);
				res.status(500).send('Internal Server Error(new):2');
			}
			// dubug purpose
			//console.log(authors);
			res.render('new', {topics:files, authors:authors});
		});
		
	});
});

//A method that creates a post (insertion)
app.post('/', function(req, res){
	var title = req.body.title;
	var description = req.body.description; 
	//fs.writeFile('data/' + title, description, function(err){
	var insertStr = 'INSERT INTO topic (title, description, created, author_id) VALUES (?,?,NOW(),?)';
	db.query(insertStr,[title, description, 'NOW()',1], function(err, result){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error(home):1');
		}
		//making files (fileSystem)
		//res.send('File is created!');
		res.redirect('/'+title);
	});
}); 


// moves to updating the contents of a title 
app.get('/update/:title', function(req, res){
	var sql4 = 'select * from topic'; 
	db.query(sql4, function(err, files){
		if(err){
			console.log(err); 
			res.status(500).send('Internal Server Error(update):1');
		}
		var title = req.params.title; // id is title 
		var Uid = 0;
		var sql5 = 'SELECT id, description FROM topic WHERE title=?';
		var desc = '';
		db.query(sql5, [title], function(err, data){
			if(err){
				console.log(err); 
				res.status(500).send('Internal Server Error(update):2');
			}
			Uid = data[0].id;
			desc = data[0].description;
			res.render('update', {topics:files, id:Uid, title:title, description:desc});
		});
	});
});

// updates db with info from user 
app.post('/update/:id', function(req, res){
	var id = req.body.id;
	var updatedTitle = req.body.title; 
	var updatedDes = req.body.description;
	console.log('Id: ' + id); 
	console.log('updatedTitle: ' + updatedTitle); 
	console.log('updatedDes: ' + updatedDes);
	var str = 'UPDATE topic SET title=?, description=?, created=NOW() WHERE id=?'; 
	db.query(str, [updatedTitle, updatedDes, id], function(err, result){
		if (err){
			console.log(err); 
			res.status(500).send('Internal Server Error(update):3');
		}
		res.redirect('/' + updatedTitle);
	});
});

// Deletes a topic 
app.post('/delete/:title', function(req, res){
	var title = req.params.title;
	db.query('SELECT id FROM topic WHERE title=?', [title], function(err, result){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error(delete):1');
		}
		var id = result[0].id;
		var str = 'DELETE FROM topic WHERE id=?';
		db.query(str, [id], function(err, data){
			if(err){
				console.log(err);
				res.status(500).send('Internal Server Error(delete):2');
			}
			// debug purpose
			console.log('ID: '+id+', Title: '+title+' is successfully  deleted!');
			res.redirect('/');
		});
	});
	console.log('title: ' + title+ ' will be deleted');
});

app.get(['/', '/:title'], function(req, res){
	//fs.readdir('data', function(err, files){
	var sql1 = 'select * from topic'; 
	db.query(sql1, function(err, files){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error(main):1');
		}
		var title = req.params.title; // id is title 
		//debug purpose 
		console.log('Title: ' + title);
		if(title){
		   // when id exists
		   //fs.readFile('data/'+id, 'utf8', function(err, data){
			var idStr = 'SELECT id FROM topic WHERE title=?';
			db.query(idStr, [title], function(err, idResult){
				if(err){
					console.log(err);
				res.status(500).send('Internal Server Error(main):2');
				}
				var id = idResult[0].id;
				//var sql2 = 'SELECT description from topic WHERE title=?';
				var sql2 = 'SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?'; 
				db.query(sql2,[id],function(err, data){
					if(err){
						console.log(err);
						res.status(500).send('Internal Server Error(main):3');
					}
					//debug purpose
					//console.log(data);
					console.log('Description: ' + data[0].description);
					res.render('view_title', {topics:files, title:title, description:data[0].description, name:data[0].name});
				});
			});
		   //var sql2 = 'SELECT description from topic WHERE title=?';
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
