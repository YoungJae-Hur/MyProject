var db = require('./mysql.template');

exports.home = function(req, res){
	console.log('----------/author---------');
	console.log('Welcome!');
	console.log('----------/author ended---------');
};

//this method creates the author in the table 
exports.create = function(req, res){
	var name = req.body.name; 
	var profile = req.body.profile;
	//console.log('----------/author/create---------');
	//console.log('Welcome!');
	//console.log('Name: ' + name); 
	//console.log('Profile: ' + profile);
	//console.log('----------/author/create ended---------');
	db.query('INSERT INTO author (name, profile) VALUES (?, ?)', [name, profile], function(err, result){ 
		if (err){
			console.log(err);
			res.status(500).send('Internal Server Error(author, create):1');
		}
		res.redirect('/author');
	});
};

// this method ipdates an author's info
exports.update = function(req, res){
	var id = req.params.id;
	console.log('----------/author/update/id---------');
	console.log('ID in update: ' + id);
	console.log('----------/author/update/id ended---------');
	db.query('SELECT * FROM topic', function (err, files){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error(author, update):1');
		}
		db.query('SELECT * FROM author',function (err, authors){
			if(err){
				console.log(err);
				res.status(500).send('Internal Server Error(author, update):2');
			}
			db.query('SELECT name, profile FROM author WHERE id=?', [id], function (err, author){
				if(err){
					console.log(err);
					res.status(500).send('Internal Server Error(author, update):3');
				}
				res.render('author_update', {topics:files, authors: authors, Uid:id, name:author[0].name, profile:author[0].profile});
			});
		});
	});
};	


exports.update_process = function (req, res){
	var id = req.body.id; 
	var name = req.body.name; 
	var profile = req.body.profile; 
	//console.log('---------update_process------------');
	//console.log('id: ' + id);
	//console.log('name: ' + name);
	//console.log('profile: ' + profile);
	//console.log('---------update_process ended------------');
	db.query('UPDATE author SET name=?, profile=? WHERE id=?', [name, profile, id], function(err, result){
		if (err){
			console.log(err);
			res.status(500).send('Internal Server Error(author, update_process):1');
		}
		res.redirect('/author');
	});	
};

exports.delete = function (req, res){
	var id = req.body.id; 
	//var name = req.body.name; 
	//var profile = req.body.profile; 
	//console.log('---------delete------------');
	//console.log('id: ' + id);
	//console.log('name: ' + name);
	//console.log('profile: ' + profile);
	//console.log('---------delete ended------------');
	db.query('DELETE FROM author WHERE id=?', [id], function(err, result){
		if (err){
			console.log(err);
			res.status(500).send('Internal Server Error(author, delete):1');
		}
		res.redirect('/author');
	});	
};