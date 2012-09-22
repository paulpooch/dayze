'use strict';

// PACKAGE DOCUMENTATION //////////////////////////////////////////////////////
// dynamodb = https://github.com/teleportd/node-dynamodb
// node-uuid = https://github.com/broofa/node-uuid
// q = 	https://github.com/kriskowal/q
//	   	https://github.com/bellbind/using-promise-q
// 	   	http://www.slideshare.net/domenicdenicola/callbacks-promises-and-coroutines-oh-my-the-evolution-of-asynchronicity-in-javascript
//		http://erickrdch.com/2012/06/how-to-wait-for-2-asynchronous-responses-on-nodejs-commonjs-promises.html
//	 	http://howtonode.org/promises
///////////////////////////////////////////////////////////////////////////////

var requirejs = require('requirejs');
var HTML_DEV_MODE = true; // Don't hit dynamo when playing with html/css/js

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
		'storage',
		'utils'
	], function(
		express, 
		consolidate,
		_,
		Backbone,
		Config,
		Storage,
		Utils
	) {	// list all dependencies for this scope

// http://www.senchalabs.org/connect/
// http://nodetuts.com/tutorials/13-authentication-in-express-sessions-and-route-middleware.html
//	var MemoryStore = require('connect/middleware/session/memory');

// http://stackoverflow.com/questions/7042340/node-js-error-cant-set-headers-after-they-are-sent

	var App = Backbone.Model.extend({

		defaults: {
			port: 80
		},

		initialize: function() {

			var that = this;																// used inside anonymous functions

			// configure express
			this.app = express();
			this.app.engine('dust', consolidate.dust);
			this.app.configure(function() {
			    that.app.set('view engine', 'dust');
			    that.app.set('views', __dirname + '/views');
			    that.app.use(express.static(__dirname + '/public'));
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

				var proceedWithUser = function(user) {
					Utils.log('Pulled user', user);
					var data = {};
					res.render('index', data);
				};

				var createAnonymousUser = function() {
					Storage.Users.createTempUser()
					.then(function(tempUserObj) {
						var cookieId = tempUserObj.cookieId;
						// Set cookie.
						res.cookie('cookieId', cookieId, { signed: true });
						var user = tempUserObj.user;
						proceedWithUser(user);
					})
					.fail(function(err) {
						Utils.log('createTempUser failed.', err);
					})
					.end();
				}

				if (HTML_DEV_MODE) {
					var data = {};
					res.render('index', data);
				} else {
					if (req.signedCookies.cookieId) {				
						Utils.log('User has cookie.', req.signedCookies.cookieId);
						Storage.Users.getUserWithCookieId(req.signedCookies.cookieId)
						.then(proceedWithUser)
						.fail(function(err) {
							Utils.log('getUserWithCookieId failed.', err);
							// Couldn't find cookieId in db.
							createAnonymousUser();
						})
						.end();
					} else {
						// http://dailyjs.com/2011/01/10/node-tutorial-9/ - find login part
						Utils.log('User does not have cookie.');
						createAnonymousUser();
					}
				}

			}); // End '/'

			// To clear all data use this.  Warning: seriously deletes everything.	
			//Storage.Users.resetTables();

			// begin listening
			this.app.listen(this.get('port'));
			Utils.log('Listening on port ' + this.get('port'));
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