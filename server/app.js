'use strict';

var requirejs = require('requirejs');

requirejs.config({
	baseUrl: __dirname,
	nodeRequire: require,
});

requirejs(['express', 'underscore', 'backbone'], function(express, _, Backbone) {

	var App = Backbone.Model.extend({

		defaults: {
			port: 3000
		},

		initialize: function() {
			this.app = express();
			this.app.set('views', __dirname + '/views');
			this.app.set('view engine', 'ejs');
			this.app.get('/', function(req, res) {
				res.render('index');
			});
			this.app.listen(this.get('port'));
			console.log('Listening on port ' + this.get('port'));
		}

	});

	new App();

});