var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var mysql = require('mysql'); 
//var popupS = require('popups');
//var JSAlert = require("js-alert");

//connecting to MySQL 
var db = require('./lib/mysql.template');

var topic = require('./lib/topic');
var author = require('./lib/author'); 
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

//A method that creates a post (Insertion)
app.post('/', function(req, res){
	var title = req.body.title;
	var description = req.body.description; 
	var author = req.body.author;
	//debug
	console.log('Author: '+author);
	//fs.writeFile('data/' + title, description, function(err){
	var insertStr = 'INSERT INTO topic (title, description, created, author_id) VALUES (?,?,NOW(),?)';
	db.query(insertStr,[title, description, author], function(err, result){
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
		db.query('SELECT * FROM author', function(err, authors){
			if(err){
				console.log(err); 
				res.status(500).send('Internal Server Error(update):2');
			}
			var title = req.params.title; // id is title 
			var Uid = 0;
			var desc = '';
			var author_Id = 0; 
			var sql5 = 'SELECT id, description, author_id FROM topic WHERE title=?';
			db.query(sql5, [title], function(err, data){
				if(err){
					console.log(err); 
					res.status(500).send('Internal Server Error(update):3');
				}
				Uid = data[0].id;
				desc = data[0].description;
				author_Id = data[0].author_id;
				//debug
				//console.log('author_Id: ' + author_Id);
				//console.log('authors: ' + authors[0].id + authors[1].id + authors[2].id);
				res.render('update', {topics:files, id:Uid, title:title, description:desc, authors:authors, author_id:author_Id });
			});
		});	
	});
});

// updates db with info from user 
app.post('/update/:id', function(req, res){
	var id = req.body.id;
	var updatedTitle = req.body.title; 
	var updatedDes = req.body.description;
	var authorId = req.body.authorId; 
	console.log('-----------------update---------------');
	console.log('Id: ' + id); 
	console.log('updatedTitle: ' + updatedTitle); 
	console.log('updatedDes: ' + updatedDes);
	console.log('authorId: ' + authorId);
	console.log('-----------------update end---------------');
	var str = 'UPDATE topic SET title=?, description=?, created=NOW(), author_id=? WHERE id=?'; 
	db.query(str, [updatedTitle, updatedDes, authorId,id], function(err, result){
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

// Main 
app.get(['/', '/:title'], function(req, res){
	//fs.readdir('data', function(err, files){
	topic.home(req, res);
});

// showing author table 
app.get('/author', function(req, res){
	author.home(req, res);
});

// create an author
app.post('/author/create', function(req, res){
	author.create(req, res);
});

// directing to updating an author's profile
app.get('/author/update/:id', function(req, res){
	author.update(req, res);
});

// updates an author's profile or name
app.post('/author/update_process', function(req, res){
	author.update_process(req, res);
});

// deletes an author's info
app.post('/author/delete', function(req, res){
	author.delete(req, res);
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
