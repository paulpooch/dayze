"use strict";

var express = require('express');
var app = express();
var port = 3000;


/* TODO: get underscore templates rendered
var _ = require('../lib/underscore/underscore');
app.engine('.html', {
  compile: function (str, options) {
    var template = _.template(str);
    return function (locals) {
      return template(locals);
    };
  }
});

app.get('/', function(req, res) {
	app.render('home/index');
});
*/

app.listen(port);
console.log('Listening on port ' + port);