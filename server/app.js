'use strict';

// PACKAGE DOCUMENTATION //////////////////////////////////////////////////////
// dynamodb = https://github.com/teleportd/node-dynamodb
// node-uuid = https://github.com/broofa/node-uuid
// q = https://github.com/kriskowal/q
//	   https://github.com/bellbind/using-promise-q
// 	   http://www.slideshare.net/domenicdenicola/callbacks-promises-and-coroutines-oh-my-the-evolution-of-asynchronicity-in-javascript
///////////////////////////////////////////////////////////////////////////////

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

// http://stackoverflow.com/questions/7042340/node-js-error-cant-set-headers-after-they-are-sent

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
				that.app.use(express.cookieParser(Config.COOKIE_SECRET_HASH));
				that.app.use(express.session({ 
					secret: Config.COOKIE_SECRET_HASH,
					store: new express.session.MemoryStore({
						reapInterval: 60000 * 10 
					}),
					cookie: { maxAge: Config.COOKIE_MAX_AGE }
				}));
			 });

			// handle requests to root
			this.app.get('/', function(req, res) {

				// Keep in mind req.session storage won't work once we have multiple app servers.
				
				req.session.visitCount = req.session.visitCount ? req.session.visitCount + 1 : 1;

				console.log('cookies', req.signedCookies);

				if (req.signedCookies.cookieId) {
				
					console.log('User has cookie.', req.signedCookies.cookieId);

					Storage.Users.getUserFromCookie(req.signedCookies.cookieId)
					.then(function(user) {
						console.log('getUserFromCookie successful.', user);

						var data = { 
							numClients: 1,
							visitCount: req.session.visitCount
						}
									    
						res.render('index', data);

					})
					.fail(function(err) {
						console.log('getUserFromCookie failed.', err);
					})
					.end();
				
				} else {

					// http://dailyjs.com/2011/01/10/node-tutorial-9/ - find login part

					console.log('User does not have cookie.');

					Storage.Users.createTempUser()
					.then(function(tempUserObj) {

						var cookieId = tempUserObj.cookieId;
						var user = tempUserObj.user;
						res.cookie('cookieId', cookieId, { signed: true });

						var data = { 
							numClients: 1,
							visitCount: req.session.visitCount
						}
									    
						res.render('index', data);

					})
					.end();

				}



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