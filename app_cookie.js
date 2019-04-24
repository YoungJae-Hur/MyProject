// this projects creates a simple shopping list web using cookie 

var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');

// connecting to port
app.listen(3000, function(){
	console.log('Connected, 3000 port!');
});

// cookie-parser is a middlewear
app.use(cookieParser('12349087asdfqwer!@#%$#%')); // secure(encrypt) the cookie 
app.get('/count', function(req, res){
	var count; 
	if(req.signedCookies.count){ //req.cookies.count
		count = parseInt(req.signedCookies.count);
	}else{
		count = 0;
	}
	count = count+1;
	res.cookie('count', count, {signed:true});
	res.send('count : ' + count);
});

var products = {
	1:{title:'The history of web 1'}, 
	2:{title:'The next web'}
};
app.get('/products', function(req, res){
	var output='';
	for(var name in products){
		output += `
			<li>
				<a href="/cart/${name}">${products[name].title}</a>
			</li>`;
		//console.log(products[name].title);
	}
	res.send(`
	<h1>Products</h1>
	<p>Click to add on the shopping cart!</p>
	<ul>${output}</ul>	
	<a href="/cart">Cart</a>	
	`);
});

app.get('/cart/:id', function(req,res){
	var id = req.params.id;
	var cart = {};
	if(req.signedCookies.cart){
		cart = req.signedCookies.cart;
	}else{
		cart = {};
	}
	if(!cart[id]){
		cart[id] = 0;
	}
	cart[id] = parseInt(cart[id]) + 1; 
	res.cookie('cart', cart, {signed:true});
	res.redirect('/cart');
});

app.get('/cart', function(req,res){
	var cart = req.signedCookies.cart;
	if(!cart){
		res.send('Cart is Empty!');
	}else{
		var output = '';
		for(var id in cart){
			output += `<li>${products[id].title}: (${cart[id]})</li>`;
		}
	}
	res.send(`
	<h1>Cart</h1>
	<ul>${output}</ul>
	<a href="/products">Products List</a>
	`);
});