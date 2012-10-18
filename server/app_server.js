///////////////////////////////////////////////////////////////////////////////
// APP SERVER
///////////////////////////////////////////////////////////////////////////////
//
// PACKAGE DOCUMENTATION //////////////////////////////////////////////////////
// dynamodb = https://github.com/teleportd/node-dynamodb
// node-uuid = https://github.com/broofa/node-uuid
// q = 	https://github.com/kriskowal/q
//	   	https://github.com/bellbind/using-promise-q
// 	   	http://www.slideshare.net/domenicdenicola/callbacks-promises-and-coroutines-oh-my-the-evolution-of-asynchronicity-in-javascript
//		http://erickrdch.com/2012/06/how-to-wait-for-2-asynchronous-responses-on-nodejs-commonjs-promises.html
//	 	http://howtonode.org/promises
///////////////////////////////////////////////////////////////////////////////

'use strict';

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
	'utils',
	'q'
], function(
	express, 
	consolidate,
	_,
	Backbone,
	Config,
	Storage,
	Utils,
	Q
) {	// list all dependencies for this scope

// http://www.senchalabs.org/connect/
// http://nodetuts.com/tutorials/13-authentication-in-express-sessions-and-route-middleware.html
//	var MemoryStore = require('connect/middleware/session/memory');

// http://stackoverflow.com/questions/7042340/node-js-error-cant-set-headers-after-they-are-sent

	var App = Backbone.Model.extend({

		defaults: {
			port: 8000
		},

		initialize: function() {

			var that = this;																// used inside anonymous functions

			// configure express
			that.app = express();
			that.app.engine('dust', consolidate.dust);
			that.app.configure(function() {
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

			// handle requests to roots
			that.app.get('/', function(req, res) {
				var data = {};
				res.render('index', data);	
			});

			var accountRestApi = new AccountRestApi(that.app);
			var eventRestApi = new EventRestApi(that.app);

			// route catch-all: must appear at the end of all app.get() calls
			that.app.get('*', function(req, res) {
				res.render('index');	
			});

			// begin listening
			that.app.listen(that.get('port'));
			Utils.log('Listening on port ' + that.get('port'));
		}

	});

	// Careful of the format stuff.
	// We're not using that.

	var verifyUser = function(cookieId) {
		var deferred = 	Q.defer();
		
		Storage.Users.getUserWithCookieId(cookieId)
		.then(function(user) {
			console.log('verifyUser pulled user', user);
			deferred.resolve(user);
		})
		.fail(function(err) {
			// Make sure if no user comes back, this does fail.
			deferred.reject(new Error(err));
		})
		.end();

		return deferred.promise;
	};

	var EventRestApi = function(app) {

		var path = Config.REST_PREFIX + 'event';

		// List
		app.get('/' + path, function(req, res) {
			var fake = { name: 'fake event', dayCode: '2012-10-20' };
			res.send(fake);
		});

		// Create 
		app.post('/' + path, function(req, res) {
			
			console.log(req.signedCookies);
			verifyUser(req.signedCookies.cookieId)
			.then(function(user) {

				// TODO: Filter request.
				//var post = filter(req.body);
				var post = req.body;
				
				//Storage.Events.createEvent(user.userId, post)
				//.then(function(result) {
				//	res.send(result);
				//});
			
			})
			.fail(function(err) {
				Utils.log('create event with invalid user account');
			})
			.end();

		});

		// Read
		app.get('/' + path + '/:id', function(req, res) {
		
		});

		// Update
		app.put('/' + path + '/:id', function(req, res) {
		
		});

		// Delete
		app.del('/' + path + '/:id', function(req, res) {
		
		});

	};

	var AccountRestApi = function(app) {

		var path = Config.REST_PREFIX + 'account';
		// List
		app.get('/' + path, function(req, res) {

			console.log('GET account');

			var proceedWithUser = function(user) {
				Utils.log('Pulled user', user);

				var sanitizedUser = { 
					displayName: user.displayName,
					isRegistered: user.isRegistered
				};
				res.send(sanitizedUser);
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

		});

	};

	new App();



});