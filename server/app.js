'use strict';

var requirejs = require('requirejs');

requirejs.config({
	baseUrl: __dirname,
	nodeRequire: require,	// tell requirejs to use node's 'require()'
});

requirejs(['express', 'consolidate', 'underscore', 'backbone'], function(express, consolidate, _, Backbone) {	// list all dependencies for this scope

	var App = Backbone.Model.extend({

		defaults: {
			port: 3000
		},

		initialize: function() {

			var that = this;																// used inside anonymous functions

			// configure express
			this.app = express();
			this.app.engine('dust', consolidate.dust);
			this.app.configure(function() {
			    that.app.set('view engine', 'dust');
			    that.app.set('views', __dirname + '/views');
			    that.app.use(express.bodyParser()); 										// now have access to dom via req.body.title, etc...
			 });

			// handle requests to root
			var numClients = 0;
			this.app.get('/', function(req, res) {
				res.render('index', { numClients: ++numClients });
			});

			// begin listening
			this.app.listen(this.get('port'));
			console.log('Listening on port ' + this.get('port'));
		}

	});

	new App();

});