'use strict';

var requirejs = require('requirejs');

requirejs.config({
	baseUrl: __dirname,
	nodeRequire: require	// tell requirejs to use node's 'require()'
});

requirejs([
		'express', 
		'consolidate', 
		'underscore', 
		'backbone', 
		'config',
		'storage'
	], function(
		express, 
		consolidate,
		_,
		Backbone,
		Config,
		Storage
	) {	// list all dependencies for this scope

// http://www.senchalabs.org/connect/
// http://nodetuts.com/tutorials/13-authentication-in-express-sessions-and-route-middleware.html
//	var MemoryStore = require('connect/middleware/session/memory');

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
				that.app.use(express.cookieParser());
				that.app.use(express.session({ 
					secret: '7G4Q0jRLP2DtCKIL28CGmSzsA2d8nu8u',
					store: new express.session.MemoryStore({
						reapInterval: 60000 * 10 
					}),
					cookie: { maxAge: 60480000000 }
				}));
			 });

			// handle requests to root
			var numClients = 10;
			this.app.get('/', function(req, res) {
				
				req.session.visitCount = req.session.visitCount ? req.session.visitCount + 1 : 1;
				
				var data = { 
					numClients: ++numClients,
					visitCount: req.session.visitCount
				}
							    
				res.render('index', data);

			});

			//Storage.Users.resetTable();

			// begin listening
			this.app.listen(this.get('port'));
			console.log('Listening on port ' + this.get('port'));
		}

	});

	var Users = function(app) {

		var path = 'users'
		// List
		app.get('/' + path + '.:format', function(req, res) {
		
		});

		// Create 
		app.post('/' + path + '.:format?', function(req, res) {
		
		});

		// Read
		app.get('/' + path + '/:id.:format?', function(req, res) {
		
		});

		// Update
		app.put('/' + path + '/:id.:format?', function(req, res) {
		
		});

		// Delete
		app.del('/' + path + '/:id.:format?', function(req, res) {
		
		});
	
	};

	new App();



});