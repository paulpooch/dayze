"use strict";

var fs = require('fs');
var express = require('express');
var app = express();
var port = 3000;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	res.render('index');
});

app.listen(port);
console.log('Listening on port ' + port);