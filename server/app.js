'use strict';

var requirejs = require('requirejs');

requirejs.config({
	baseUrl: __dirname,
	nodeRequire: require,
});

requirejs(['order!express', 'order!underscore', 'order!backbone'], function(express, _, Backbone) {

	var App = Backbone.Model.extend({

		defaults: {
			port: 3000;
		},

		initialize: {
			this.app = express();
			this.app.set('views', __dirname + '/views');
			this.app.set('view engine', 'ejs');
			this.app.get('/', function(req, res) {
				res.render('index');
			});
			this.app.listen(this.get(port));
			console.log('Listening on port ' + this.get(port));
		}

	});

});