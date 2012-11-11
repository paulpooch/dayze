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
//
// Automatically update user's last activity time during frontDoor.
//
// Awesome validation framework.
//
///////////////////////////////////////////////////////////////////////////////

'use strict';

var requirejs = require('requirejs');

requirejs.config({
	baseUrl: __dirname,
	nodeRequire: require,	// tell requirejs to use node's 'require()'
	packages: [{
		name: 'filter',
		location: __dirname + '/public/js/filter'
	}]
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
	'logg',
	'public/js/filter' // Sharing client code.
], function(
	express, 
	consolidate,
	_,
	Backbone,
	Config,
	Storage,
	Utils,
	Q,
	Log,
	Filter
) {	// list all dependencies for this scope

// http://www.senchalabs.org/connect/
// http://nodetuts.com/tutorials/13-authentication-in-express-sessions-and-route-middleware.html
//	var MemoryStore = require('connect/middleware/session/memory');

// http://stackoverflow.com/questions/7042340/node-js-error-cant-set-headers-after-they-are-sent

	///////////////////////////////////////////////////////////////////////////////
	// FRONT DOOR
	///////////////////////////////////////////////////////////////////////////////
	var frontDoor = function(req, res, action) {
			var deferred = 	Q.defer();
			if (Filter.clean(req, action).passed) {
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
					res.send({ error: 'User has no cookieId.' });
					deferred.reject(new Error('User has no cookieId.'));
				}
			} else {
				res.send({ error: 'Request reject by filter.' });
				deferred.reject(new Error('Request reject by filter.'));
			}
			return deferred.promise;
		};

	///////////////////////////////////////////////////////////////////////////////
	// EVENT REST
	///////////////////////////////////////////////////////////////////////////////
	var EventRestApi = function(app) {

		var EventRestApi = {};
		var path = Config.REST_PREFIX + 'event';

		EventRestApi.list = function(req, res) {
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
		};

		EventRestApi.create = function(req, res) {
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
		};

		EventRestApi.read = function(req, res) {
			Log.l();
			Log.l('EVENT READ ////////////////////');
			Log.l();
		};

		EventRestApi.update = function(req, res) {
			Log.l();
			Log.l('EVENT UPDATE ////////////////////');
			Log.l();
		};

		EventRestApi.delete = function(req, res) {
			Log.l();
			Log.l('EVENT DELETE ////////////////////');
			Log.l();
		};

		app.get('/' + path, EventRestApi.list);
		app.post('/' + path, EventRestApi.create);
		app.get('/' + path + '/:id', EventRestApi.read);
		app.put('/' + path + '/:id', EventRestApi.update);
		app.del('/' + path + '/:id', EventRestApi.delete);
		
		return EventRestApi;

	};


	///////////////////////////////////////////////////////////////////////////////
	// ACCOUNT REST
	///////////////////////////////////////////////////////////////////////////////
	var AccountRestApi = function(app) {

		var AccountRestApi = {};
		var path = Config.REST_PREFIX + 'account';

		AccountRestApi.list = function(req, res) {
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
		};

		AccountRestApi.create = function(req, res) {
			Log.l();
			Log.l('ACCOUNT CREATE ////////////////////');
			Log.l();

			//Log.l(req);
			//Log.l("RESPONSE");
			//Log.l(res);

			frontDoor(req, res, 'account.create')
			.then(function(user) {
				// TODO: Filter request.
				//var post = filter(req.body);
				var post = req.body;
				Log.l(post);
				Storage.Users.createAccount(user, post)
				.then(function(result) {
					res.send(result);
				})
				.end();
			})
			.fail(function(err) {
				Log.e('Error in ACCOUNT CREATE', err, err.stack);
			})
			.end();
		};
		
		app.post('/' + path, AccountRestApi.create);
		app.get('/' + path, AccountRestApi.list);

		return AccountRestApi;

	};

	///////////////////////////////////////////////////////////////////////////////
	// TESTS
	///////////////////////////////////////////////////////////////////////////////
	// We could push this to a separate process with true HTTP requests:
	// http://docs.nodejitsu.com/articles/HTTP/clients/how-to-create-a-HTTP-request
	var Tests = (function() { 
		var Tests = {};

		var FakeRequest = function() { };
		var FakeResponse = function() { 
			this.send = function(data) {
				Log.l(data);
			}
		};

		Tests.run = function(accountRestApi) {

			var req = new FakeRequest(),
				res = new FakeResponse();

			req.body = {};
			req.body.createAccountEmail = 'test@test.com';

			accountRestApi.create(req, res);
		
		};
		return Tests;
	})();

	///////////////////////////////////////////////////////////////////////////////
	// SERVER
	///////////////////////////////////////////////////////////////////////////////
	var Server = (function() { 

		// configure express
		var app = express();
		app.engine('dust', consolidate.dust);
		app.configure(function() {
		app.set('view engine', 'dust');
		app.set('views', __dirname + '/views');
		app.use(express.static(__dirname + '/public'));
		app.use(express.bodyParser()); // now have access to dom via req.body.title, etc...
		app.use(express.cookieParser(Config.COOKIE_SECRET_HASH));
		app.use(express.session({ 
				secret: Config.COOKIE_SECRET_HASH,
				store: new express.session.MemoryStore({
					reapInterval: 60000 * 10 
				}),
				cookie: { maxAge: Config.COOKIE_MAX_AGE }
			}));
		 });

		var accountRestApi = AccountRestApi(app);
		var eventRestApi = EventRestApi(app);

		// handle requests to roots
		app.get('/', function(req, res) {
			Log.l('INDEX ////////////////////');

			var data = {};
			res.render('index', data);	
		});

		// cache facebook channel file
		app.get('/channel.html', function(req, res) {
			// set expiration headers for 1 year
			// tested headers with 'curl -I domain/channel.html'
			var maxAge = 60 * 60 * 24 * 365;
            res.setHeader("Cache-Control", "public, max-age=" + maxAge); // 4 days
	        res.setHeader("Expires", new Date(Date.now() + maxAge * 1000).toUTCString());
			res.render('channel');
		});

		// route catch-all: must appear at the end of all app.get() calls
		app.get('*', function(req, res) {
			Log.l('catch-all');
			var data = {};
			res.render('index', data);
		});

		// begin listening
		app.listen(Config.PORT);
		Log.l('Listening on port ' + Config.PORT);

		if (Config.RUN_TESTS) {
			//Tests.run(accountRestApi);
		}

	})();

});