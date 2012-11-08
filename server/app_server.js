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

///////////////////////////////////////////////////////////////////////////////
//
// MASTER TODO:
//
// Unified exception handling scheme.
// Maybe let all errors fall through to a single handler per REST request?
// Also direct all errors to pretty logging solution.
//
// Make pullEvents intelligent.  Caching.  Not repull.  Etc.
//
// Install memcached to windows.
// http://www.codeforest.net/how-to-install-memcached-on-windows-machine
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
	'q',
	'logg'
], function(
	express, 
	consolidate,
	_,
	Backbone,
	Config,
	Storage,
	Utils,
	Q,
	Log
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

			var that = this; // used inside anonymous functions

			// configure express
			that.app = express();
			that.app.engine('dust', consolidate.dust);
			that.app.configure(function() {
			that.app.set('view engine', 'dust');
			that.app.set('views', __dirname + '/views');
			that.app.use(express.static(__dirname + '/public'));
			that.app.use(express.bodyParser()); // now have access to dom via req.body.title, etc...
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
				Log.l('INDEX ////////////////////');

				var data = {};
				res.render('index', data);	
			});

			var accountRestApi = new AccountRestApi(that.app);
			var eventRestApi = new EventRestApi(that.app);

			// route catch-all: must appear at the end of all app.get() calls
			that.app.get('/*', function(req, res) {
				Log.l('catch-all');
				res.render('index');
			});

			// begin listening
			that.app.listen(that.get('port'));
			Log.l('Listening on port ' + that.get('port'));
		}

	});

	// Careful of the format stuff.
	// We're not using that.

	var frontDoor = function(req) {

		// TODO
		// Validate & Filter req

		var deferred = 	Q.defer();
		
		if (req.signedCookies.cookieId) {
			var cookieId = req.signedCookies.cookieId;	
			Storage.Users.getUserWithCookieId(cookieId)
			.then(function(user) {
				Log.l('verifyUser pulled user', user);
				deferred.resolve(user);
			})
			.fail(function(err) {
				// Make sure if no user comes back, this does fail.
				Log.e('verifyUser failed', err, err.stack);
				deferred.reject(new Error(err));
			})
			.end();
		} else {
			deferred.reject(new Error('User has no cookieId'));
		}

		return deferred.promise;
	};










	///////////////////////////////////////////////////////////////////////////////
	// EVENT REST
	///////////////////////////////////////////////////////////////////////////////
	var EventRestApi = function(app) {

		var path = Config.REST_PREFIX + 'event';

		// List
		app.get('/' + path, function(req, res) {
			Log.l();
			Log.l('EVENT LIST ////////////////////');
			Log.l();

			Log.l('cookies =', req.signedCookies);

			frontDoor(req)
			.then(function(user) {
				var monthCode = req.query['monthCode'];
				if (monthCode) {
					Storage.Events.getEventsForMonth(user, monthCode)
					.then(function(events) {
						Log.l('got events for month', events);
						res.send(events);
					})
					.end();					
				}
			})
			.fail(function(err) {
				Log.e('Error in EVENT LIST.', err, err.stack);
			})
			.end();			
			
		});

		// Create 
		app.post('/' + path, function(req, res) {
			Log.l();
			Log.l('EVENT CREATE ////////////////////');
			Log.l();

			frontDoor(req)
			.then(function(user) {
				// TODO: Filter request.
				//var post = filter(req.body);
				var post = req.body;
				Log.l(post);

				Storage.Events.createEvent(user, post)
				.then(function(result) {
					res.send(result);
				})
				.end();
			
			})
			.fail(function(err) {
				Log.e('Error in EVENT CREATE', err, err.stack);
			})
			.end();

		});

		// Read
		app.get('/' + path + '/:id', function(req, res) {
			Log.l();
			Log.l('EVENT READ ////////////////////');
			Log.l();
		});

		// Update
		app.put('/' + path + '/:id', function(req, res) {
			Log.l();
			Log.l('EVENT UPDATE ////////////////////');
			Log.l();
		});

		// Delete
		app.del('/' + path + '/:id', function(req, res) {
			Log.l();
			Log.l('EVENT DELETE ////////////////////');
			Log.l();
		});

	};










	///////////////////////////////////////////////////////////////////////////////
	// ACCOUNT REST
	///////////////////////////////////////////////////////////////////////////////
	var AccountRestApi = function(app) {

		var path = Config.REST_PREFIX + 'account';
		// List
		app.get('/' + path, function(req, res) {
			Log.l();
			Log.l('ACCOUNT LIST ////////////////////');
			Log.l();

			var proceedWithUser = function(user) {
				if (!user.displayName) {
					user.displayName = Config.DEFAULT_USER_NAME;
				}
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
					Log.e('createTempUser failed.', err, err.stack);
				})
				.end();
			}

			if (req.signedCookies.cookieId) {
				Storage.Users.getUserWithCookieId(req.signedCookies.cookieId)
				.then(proceedWithUser)
				.fail(function(err) {
					Log.e('getUserWithCookieId failed.', err, err.stack);
					// Couldn't find cookieId in db.
					createAnonymousUser();
				})
				.end();
			} else {
				// http://dailyjs.com/2011/01/10/node-tutorial-9/ - find login part
				createAnonymousUser();
			}

		});

	};

	new App();



});