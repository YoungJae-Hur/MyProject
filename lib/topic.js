var db = require('./mysql.template');

exports.home = function(req, res){
	var sql1 = 'select * from topic'; 
	db.query(sql1, function(err, files){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error(main):1');
		}
		var title = req.params.title; // id is title 
		//debug purpose 
		console.log('Title: ' + title);
		if(title == 'author'){
			var authorStr = 'SELECT * FROM author';
			db.query(authorStr, function(err, author){
				if (err){
					console.log(err);
					res.status(500).send('Internal Server Error(author in main):1');
				}
				res.render('author', {topics:files, authors: author});
			});
			
		}
		else if(typeof title != 'undefined'){
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
};