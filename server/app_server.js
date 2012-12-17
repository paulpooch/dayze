///////////////////////////////////////////////////////////////////////////////
// APP SERVER
///////////////////////////////////////////////////////////////////////////////
//
// PACKAGE DOCUMENTATION //////////////////////////////////////////////////////
// dynamodb = https://github.com/teleportd/node-dynamodb
// node-uuid = https://github.com/broofa/node-uuid
// amazon-ses = https://github.com/jjenkins/node-amazon-ses
// validator = https://github.com/chriso/node-validator
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
// Automatically update user's last activity time during frontDoor?  maybe login======//
// Awesome validation framework.
//
// Clean out table job
// -expired links
// -temp accounts with lastactivity > 1 month
//
// Do we really care about model validation?
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
	'public/js/filter', // Sharing client code.
	'email'
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
	Filter,
	Email
) {	// list all dependencies for this scope

// http://www.senchalabs.org/connect/
// http://nodetuts.com/tutorials/13-authentication-in-express-sessions-and-route-middleware.html
//	var MemoryStore = require('connect/middleware/session/memory');

// http://stackoverflow.com/questions/7042340/node-js-error-cant-set-headers-after-they-are-sent

	var ERROR_BAD_REQUEST = 400;
	var ERROR_RETRYABLE = 500;

	///////////////////////////////////////////////////////////////////////////////
	// FRONT DOOR
	///////////////////////////////////////////////////////////////////////////////
	var frontDoor = function(req, res, restAction) {
		var deferred = 	Q.defer();
		if (req.signedCookies.cookieId) {
			var cookieId = req.signedCookies.cookieId;	
			Storage.Users.getUserWithCookieId(cookieId)
			.then(function(user) {
				deferred.resolve(user);
			})
			.fail(function(err) {
				deferred.reject(new Error(err));
			})
			.end();
		} else {
			if (restAction == 'account.list') {
				deferred.resolve(null);
			} else {
				deferred.reject(new Error('User has no cookieId.'));
			}
		}
		return deferred.promise;
	};

	var filterAction = function(req, res, action) {
		var deferred = 	Q.defer();
		var filterResult = Filter.clean(req, action);
		// Make sure nobody uses dirty vals.
		req.body = null;
		req.query = null;
		req.params = null;

		if (filterResult.passed) { 
			deferred.resolve(filterResult.cleaned);
		} else {
			// Compile filter errors
			var errorHtml = [];
			for (var key in filterResult.errors) {
				if (filterResult.errors.hasOwnProperty(key)) {
					var error = filterResult.errors[key];
					errorHtml.push('<p><strong>', key, ': </strong>', error, '</p>');
				}
			}
			errorHtml = errorHtml.join('');
			deferred.reject(new Error('Request rejected by filter.<br/>' + errorHtml));
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
			frontDoor(req, res)
			.then(function(user) {

				return filterAction(req, res, 'event.list')
				.then(function(clean) {
					var monthCode = clean['monthCode'];
					if (monthCode) {
					
						return Storage.Events.getEventsForMonth(user, monthCode)
						.then(function(events) {
							Log.l('got events for month', events);
							res.send(events);
							return;
						})
						.end();

					}			
				})
				.end();

			})	
			.fail(function(err) {
				Log.e('Error in EVENT LIST', err, err.stack);
				res.send(ERROR_BAD_REQUEST, { errors: err.message });
				return;
			})
			.end();
		};


		// REDO THIS!
		EventRestApi.create = function(req, res) {
			Log.l();
			Log.l('EVENT CREATE ////////////////////');
			Log.l();

			frontDoor(req)
			.then(function(user) {

				return filterAction(req, res, 'event.create')
				.then(function(clean) {
				
					return Storage.Events.createEvent(user, clean)
					.then(function(result) {
						res.send(result);
						return;
					})
					.end();
			
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

		// Doing login stuff?
		// http://dailyjs.com/2011/01/10/node-tutorial-9/ - find login part

		AccountRestApi.list = function(req, res) {
			Log.l();
			Log.l('ACCOUNT LIST ////////////////////');
			Log.l();
			frontDoor(req, res, 'account.list')
			.then(function(user) {
				
				return filterAction(req, res, 'account.list')
				.then(function(clean) {

					if (clean['id'] && (!user || user.userId != clean['id'])) {
						res.send({ errors: 'Account requested was not your account.'});
						return;
					}
					if (!user) {

						return Storage.Users.createTempUser()
						.then(function(tempUserObj) {
							var cookieId = tempUserObj.cookieId;
							var user = tempUserObj.user;
							// Set cookie.
							res.cookie('cookieId', cookieId, { signed: true });
							res.send(Filter.forClient(user, Filter.clientBlacklist.user));
							return;
						})
						.end();

					} else {

						res.send(Filter.forClient(user, Filter.clientBlacklist.user));
						return;
					}
				})
				.end();

			})			
			.fail(function(err) {
				Log.e('Error in ACCOUNT LIST', err, err.stack);
				res.send(ERROR_BAD_REQUEST, { errors: err.message });
				return;
			})
			.end();
		};

		// Read has same functionality as list.
		// Either way you can only read 1 account - yours.
		AccountRestApi.read = AccountRestApi.list;

		AccountRestApi.patch = function(req, res) {
			Log.l();
			Log.l('ACCOUNT PATCH ////////////////////');
			Log.l();
			frontDoor(req, res)
			.then(function(user) {

				return filterAction(req, res, 'account.patch')
				.then(function(clean) {

					var anyChange = false;
					if (clean['password']) {
						anyChange = true;
						var pw = clean['password'];
						var salt = Utils.generatePassword(16);
						var pwHash = Utils.hashSha512(pw + salt);
						user.passwordHash = pwHash;
						user.passwordSalt = salt;
						user.missingPassword = 0;
					}
					if (clean['displayName']) {
						anyChange = true;
						user.displayName = clean.displayName;
					}
					if (clean['unconfirmedEmail']) {
						anyChange = true;
						user.unconfirmedEmail = clean.unconfirmedEmail;							

						// Do not return this Q chain.  Should run in parallel and let below code run.
						Storage.CustomLinks.makeEmailConfirmationLink(user)
						.then(function(link) {
							return Email.sendEmailConfirmation(user, link);
						})
						.end();

					}
					if (anyChange) {
						return Storage.Users.update(user);	
					} else {
						return;
					}						
					
				})
				.then(function(user) {
					if (user) {
						//res.send(Filter.forClient(user, Filter.clientBlacklist.user));
						res.send();
						return;
					}
					return false;
				})
				.end();

			})
			.fail(function(err) {
				Log.e('Error in ACCOUNT PATCH', err, err.stack);
				res.send(ERROR_BAD_REQUEST, { errors: err.message });
				return;
			})
			.end();
		};

		AccountRestApi.update = function(req, res) {
			Log.l();
			Log.l('ACCOUNT UPDATE ////////////////////');
			Log.l();
			frontDoor(req, res)
			.then(function(user) {
				var state = req.body['state'];
				if (state == 'createAccount') {
					
					return filterAction(req, res, 'account.createAccount')
					.then(function(clean) {
						return Storage.Users.createAccount(user, clean);
					})
					.then(function(newUser) {

						return Storage.CustomLinks.makeEmailConfirmationLink(newUser)
						.then(function(link) {
							return Email.sendEmailConfirmation(newUser, link);
						})
						.then(function(data) {
							//res.send(Filter.forClient(user, Filter.clientBlacklist.user));
							res.send();
							return;
						})
						.end();

					})
					.end();

				} else if (state =='initialPwSet') {
								
					return filterAction(req, res, 'account.initialPwSet')
					.then(function(clean) {

						var pw = clean['password'];
						var salt = Utils.generatePassword(16);
						var pwHash = Utils.hashSha512(pw + salt);
						user.passwordHash = pwHash;
						user.passwordSalt = salt;
						user.missingPassword = 0;
						return Storage.Users.update(user);	
						
					})
					.then(function(user) {
						res.send();
						return;
					})
					.end();

				} else if (state == 'login') {

					return filterAction(req, res, 'account.login')
					.then(function(clean) {
Log.l('login', clean);	
						res.send();
						return;
					})
					.end();

				}
			})
			.fail(function(err) {
				Log.e('Error in ACCOUNT UPDATE', err, err.stack);
				res.send(ERROR_BAD_REQUEST, { errors: err.message });
				return;
			})
			.end();
		};
		
		app.get('/' + path, AccountRestApi.list);
		app.get('/' + path + '/:id', AccountRestApi.read);
		app.put('/' + path + '/:id', AccountRestApi.update);
		app.patch('/' + path + '/:id', AccountRestApi.patch);

		return AccountRestApi;

	};

	///////////////////////////////////////////////////////////////////////////////
	// LINK REST
	///////////////////////////////////////////////////////////////////////////////
	var LinkRestApi = function(app) {
		var LinkRestApi = {};
		var path = Config.REST_PREFIX + 'link';

		LinkRestApi.read = function(req, res) {
			Log.l();
			Log.l('LINK READ ////////////////////');
			Log.l();
			frontDoor(req, res)
			.then(function(user) {

				return filterAction(req, res, 'link.read')
				.then(function(clean) {

					var linkId = clean.linkId;
					return Storage.CustomLinks.getLink(user, linkId);

				})
				.then(function(link) {
					
					if (link.type === 'email_confirmation') {
						user.isFullUser = 1;
						user.email = link.pendingEmail;
						user.unconfirmedEmail = null;

						return Storage.Users.update(user)
						.then(function(result) {
							res.send(Filter.forClient(link, Filter.clientBlacklist.link));
							return;
						})
						.end();

					} else {
						res.send({ errors: 'Link was invalid.'});
						return;
					}
				})
				.end();

			})			
			.fail(function(err) {
				Log.e('Error in LINK READ', err, err.stack);
				res.send(ERROR_BAD_REQUEST, { errors: err.message });
				return;
			})
			.end();
		};

		app.get('/' + path + '/:linkId', LinkRestApi.read);
		return LinkRestApi;
	};

	///////////////////////////////////////////////////////////////////////////////
	// TESTS
	///////////////////////////////////////////////////////////////////////////////
	// We could push this to a separate process with true HTTP requests:
	// http://docs.nodejitsu.com/articles/HTTP/clients/how-to-create-a-HTTP-request
	var Tests = (function() { 
		var Tests = {};

		var FakeRequest = function() {
			this.signedCookies = {};
			this.signedCookies.cookieId = 'yXs9Bmn8bnHZEM2FwLWJ';
			this.body = {};
			this.query = {};
		};
		var FakeResponse = function() { 
			this.send = function(data) {
				Log.l('FAKE RESPONSE //////////////////////////////////////');
				Log.l(data);
			}
		};

		Tests.run = function(accountRestApi) {

			var req = new FakeRequest(),
				res = new FakeResponse();

			req.body.unconfirmedEmail = 'test@test.com';

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
		var linkRestApi = LinkRestApi(app);

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
            res.setHeader("Cache-Control", "public, max-age=" + maxAge);
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
			Tests.run(accountRestApi);
		}

	})();

});