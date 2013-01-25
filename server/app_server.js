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
/*

1. CSRF Tokens
2. Make pullEvents intelligent.  Caching.  Not repull.  Etc.
4. login security - does user have permission to do action / is user really logged in (Paul)
5. event create
6. show events on cal
2. profile pics (John)
8. remember me
20. wrap db calls in some kind of over API limit handler - increase capacity temporarily. (DANGEROUS!)
	maybe just email me instead. and ill do it manually?
	maybe log context of call so we can work on optimizing?

POSTLAUNCH

7. friending
8. show friends events
9. privacy
10. google cal sync
11. google friend sync
12. fb cal sync
13. fb friend sync

*/
///////////////////////////////////////////////////////////////////////////////

'use strict';

var requirejs = require('requirejs');

requirejs.config({
	baseUrl: __dirname,
	nodeRequire: require,	// tell requirejs to use node's 'require()'
	packages: [{
		name: 'filter',
		location: __dirname + '/public/js/filter'
	}, {
		name: 'collections',
		location: __dirname + '/public/js/collections'
	}, {
		name: 'models',
		location: __dirname + '/public/js/models'
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
	'public/js/c',
	'server_error'
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
	C,
	ServerError
) {	// list all dependencies for this scope

// http://www.senchalabs.org/connect/
// http://nodetuts.com/tutorials/13-authentication-in-express-sessions-and-route-middleware.html
//	var MemoryStore = require('connect/middleware/session/memory');

// http://stackoverflow.com/questions/7042340/node-js-error-cant-set-headers-after-they-are-sent

	///////////////////////////////////////////////////////////////////////////////
	// FRONT DOOR
	///////////////////////////////////////////////////////////////////////////////
	var frontDoor = function(req, res, specialCase) {
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
			if (specialCase && C.FrontDoorSpecialCase.NoAccountRequired.hasOwnProperty(specialCase)) {
				deferred.resolve(null);
			} else {
				deferred.reject(new ServerError(C.ErrorCodes.AccountNoCookie));
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
			deferred.reject(new ServerError(C.ErrorCodes.Filter, action, 'Request rejected by filter.<br/>' + errorHtml));
		}
		return deferred.promise;
	};

	var sendError = function(res, err) {
		err = err || {};
Log.l('sendError', err);
		var httpCode = err.httpCode || C.HttpCodes.GenericServerError;
		res.send(httpCode, err);
	};

	var sendSuccess = function(res, obj, blacklist) {
		if (obj && blacklist) {
			res.send(Filter.forClient(obj, blacklist));
		} else {
			res.send();
		}
	};

	///////////////////////////////////////////////////////////////////////////////
	// FRIEND REST
	///////////////////////////////////////////////////////////////////////////////

	var FriendRestApi = function(app) {
		
		var FriendRestApi = {};
		var path = Config.REST_PREFIX + 'friend';

		FriendRestApi.list = function(req, res) {
			Log.l();
			Log.l('FRIEND LIST ////////////////////');
			Log.l();
			frontDoor(req, res)
			.then(function(user) {

				return filterAction(req, res, C.FilterAction.FriendList)
				.then(function(clean) {

					return Storage.Friends.getFriends(user.userId)
					.then(function(friends) {

						// Use user blacklist.
						sendSuccess(res, friends, Filter.clientBlacklist.user);
						return;
					
					});
							
				});

			})	
			.fail(function(err) {
				Log.e('Error in FRIEND LIST', err, err.stack);
				sendError(res, err);
				return;
			})
			.end();
		};

		app.get('/' + path, FriendRestApi.list);
	
		return FriendRestApi;

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

				return filterAction(req, res, C.FilterAction.EventList)
				.then(function(clean) {

					var dayCode = clean['dayCode'];
					var monthCode = clean['monthCode'];
					if (dayCode) {

						return Storage.Events.getEventsForDay(user, dayCode)
						.then(function(events) {

							Log.l('got events for day', events);
							sendSuccess(res, events, Filter.clientBlacklist.event);
							return;
						
						});

					} else if (monthCode) {
					
						return Storage.Events.getEventsForMonth(user, monthCode)
						.then(function(events) {

							Log.l('got events for month', events);
							sendSuccess(res, events, Filter.clientBlacklist.event);
							return;
						
						});

					}			
				});

			})	
			.fail(function(err) {
				Log.e('Error in EVENT LIST', err, err.stack);
				sendError(res, err);
				return;
			})
			.end();
		};

		EventRestApi.create = function(req, res) {
			Log.l();
			Log.l('EVENT CREATE ////////////////////');
			Log.l();

			frontDoor(req, res)
			.then(function(user) {
Log.l(req.body);
				return filterAction(req, res, C.FilterAction.EventCreate)
				.then(function(clean) {
				
					return Storage.Events.createEvent(user, clean)
					.then(function(event) {
Log.l('event created successfully', event);
						sendSuccess(res, event, Filter.clientBlacklist.event);
						return;
					
					});

				});

			})
			.fail(function(err) {
				Log.e('Error in EVENT CREATE', err, err.stack);
				sendError(res, err);
			})
			.end();

		};

		EventRestApi.read = function(req, res) {
			Log.l();
			Log.l('EVENT READ ////////////////////');
			Log.l();

			frontDoor(req, res)
			.then(function() {

				return filterAction(req, res, C.FilterAction.EventRead)
				.then(function(clean) {

					var eventId = clean.eventId;
					return Storage.Events.getEventDetails(eventId)
					.then(function(event) {

						sendSuccess(res, event, Filter.clientBlacklist.event);
						return;

					});

				});

			})
			.fail(function(err) {
				Log.e('Error in EVENT READ', err, err.stack);
				sendError(res, err);
			})
			.end();

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
		app.get('/' + path + '/:eventId', EventRestApi.read);
		app.put('/' + path + '/:eventId', EventRestApi.update);
		app.del('/' + path + '/:eventId', EventRestApi.delete);
		
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
			frontDoor(req, res, C.States.AccountList)
			.then(function(user) {
				
				return filterAction(req, res, C.FilterAction.AccountList)
				.then(function(clean) {

					if (clean['id'] && (!user || user.userId != clean['id'])) {
						sendError(res, new ServerError(C.ErrorCodes.AccountNotYourId));
						return;
					}
					if (!user) {

						return Storage.Users.createTempUser()
						.then(function(tempUser) {
							var cookieId = tempUser.cookieId;
							// Set cookie.
							res.cookie('cookieId', cookieId, { signed: true });
							
							sendSuccess(res, tempUser, Filter.clientBlacklist.user);
							return;

						});

					} else {

						res.send(Filter.forClient(user, Filter.clientBlacklist.user));
						return;
					}
				});

			})			
			.fail(function(err) {
				Log.e('Error in ACCOUNT LIST', err, err.stack);
				sendError(res, err);
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

				return filterAction(req, res, C.FilterAction.AccountPatch)
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
					
						// Don't return. Run in parallel.
						Storage.Users.setNewEmail(user);
					
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
				});

			})
			.fail(function(err) {
				Log.e('Error in ACCOUNT PATCH', err, err.stack);
				sendError(res, err);
				return;
			})
			.end();
		};

		AccountRestApi.update = function(req, res) {
			Log.l();
			Log.l('ACCOUNT UPDATE ////////////////////');
			Log.l();

			var state = req.body['state'];
			frontDoor(req, res, state)
			.then(function(user) {

				if (state == C.States.Create) {
					
					return filterAction(req, res, C.FilterAction.AccountCreate)
					.then(function(clean) {

						var email = clean['unconfirmedEmail'];
						
Log.l('searching for email conflicts', email);
						return Storage.Users.getUserWithEmail(email)
						.then(function(userWithEmail) {
Log.l('userWithEmail = ', userWithEmail);

							if (userWithEmail) {
								
								sendError(res, new ServerError(C.ErrorCodes.AccountEmailTaken));
								return;
							
							} else {

								return Storage.Users.createAccount(user, clean)
								.then(Storage.Users.setNewEmail)
								.then(function(data) {
									//res.send(Filter.forClient(user, Filter.clientBlacklist.user));
									res.send();
									return;
								});

							}
						});

					});
						
				} else if (state == C.States.InitialPasswordSet || state == C.States.PasswordReset) {
								
					// Important security check here!
					if (state == C.States.PasswordReset ||
					(state == C.States.InitialPasswordSet &&
					(user.missingPassword == 1 && !user.passwordHash && !user.passwordSalt))) {

						return filterAction(req, res, C.FilterAction.PasswordChange)
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
							sendSuccess(res);
							return;
						});

					}

				} else if (state == C.States.Login) {

					return filterAction(req, res, C.FilterAction.AccountLogin)
					.then(function(clean) {

						var email = clean['loginEmail']
						var pw = clean['loginPassword'];

						return Storage.Users.getUserWithEmail(email)
						.then(function(user) {

							if (user) {

								if (user.isFullUser && !user.missingPassword) {

Log.l('getUserWithEmail', email, user);
									var salt = user.passwordSalt;
									var attemptedPwHash = Utils.hashSha512(pw + salt);
									if (attemptedPwHash === user.passwordHash) {
Log.l('success');
										return Storage.Users.updateAndAutoLogin(user, res)
										.then(function(userResPair) {

											var user = userResPair.user;
											var res = userResPair.res;
Log.l('sendSuccess', user);
											sendSuccess(res, user, Filter.clientBlacklist.user);
											return;

										});

									} else {

										sendError(res, new ServerError(C.ErrorCodes.AccountLoginPassword));
										return;
									}

								} else {

									sendError(res, new ServerError(C.ErrorCodes.AccountLoginPartialAccount));
									return;

								} 

							} else {

								// It's bad practice to reveal if the email is or is not an account.
								// Usability over security.
								sendError(res, new ServerError(C.ErrorCodes.AccountLoginEmail));
								return;

							}
						});

					});

				} else if (state == C.States.GoogleLogin) {
				 	// https://developers.google.com/accounts/docs/OAuth2UserAgent

					var token = null;

					return filterAction(req, res, C.FilterAction.AccountOAuthGoogleLogin)
					.then(function(clean) {

						// validate oauth token
						var deferred = 	Q.defer();

						token = clean['googleToken'];

						var options = {
						  host: 'www.googleapis.com',
						  path: '/oauth2/v1/tokeninfo?access_token=' + token
						};

						return Utils.qHttpsRequest(options);

					}).then(function(response) {
Log.l(response);
						// fetch user id and email
						if (response.error === undefined &&
						response.error_description === undefined &&
						response.audience == Config.GOOGLE_CLIENT_ID) {

							var id = response.user_id,
								email = response.email;

							// check for user with google id
							return Storage.Users.getUserWithGoogleId(id)
							.then(function(user) {

								if (user) {
									// update token and login
Log.l('getUserWithGoogleId', email, user);
Log.l('success');
Log.l(user);
									user.googleToken = token;

									return Storage.Users.updateAndAutoLogin(user, res)
									.then(function(userResPair) {

										var user = userResPair.user;
										var res = userResPair.res;
										sendSuccess(res, user, Filter.clientBlacklist.user);
										return;

									});

								} else {

									// create account with google id
Log.l('createGoogleAccount');
Log.l('token: ' + token);
Log.l('id: ' + id);
Log.l('email: ' + email);
									return Storage.Users.createGoogleAccount(token, id, email)
									.then(function(user) {
									
										/* TODO: broken.	
										return Storage.Users.updateAndAutoLogin(user, res)
										.then(function(user) {

											sendSuccess(res, user, Filter.clientBlacklist.user);
											return;

										});*/

									});

								}

							});

						} else {

							sendError(res, new ServerError(C.ErrorCodes.InvalidOAuthToken));
							return;
						}
					});	


				} else if (state == C.States.Logout) {
Log.l('LOGGING OUT');
					res.clearCookie('cookieId');
					sendSuccess(res);
					return;

				} else if (state == C.States.ForgotPassword) {

					return filterAction(req, res, C.FilterAction.AccountForgot)
					.then(function(clean) {

						var forgotEmail = clean['forgotEmail'];
						return Storage.Users.getUserWithEmail(forgotEmail)
						.then(function(userWithEmail) {

							if (userWithEmail) {

								return Storage.Users.resetPassword(userWithEmail)
								.then(function(resetPasswordResult) {
						
									sendSuccess(res, userWithEmail, Filter.clientBlacklist.user);
									return;
						
								});

							} else {

								// It's bad practice to reveal if the email is or is not an account.
								// But for now that's how we do login too.  Usability over security.
								sendError(res, new ServerError(C.ErrorCodes.AccountForgotNoAccount));
								//sendSuccess(res);
								return;

							}

						});

					});

				}

			})
			.fail(function(err) {
				Log.e('Error in ACCOUNT UPDATE', err, err.stack);
				sendError(res, err);
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
			frontDoor(req, res, C.States.Link)
			.then(function() {

				// Links must pull up user if needed.
				return filterAction(req, res, C.FilterAction.LinkRead)
				.then(function(clean) {

					var linkId = clean.linkId;
					return Storage.CustomLinks.getLink(linkId);

				})
				.then(function(link) {

					return Storage.Users.getUserWithId(link.userId)
					.then(function(user) {

						// WARNING: LOGGING USER IN HERE!
						// All future code paths must save user.
						user.isLoggedIn = 1;

						return Storage.Users.setCookie(user)
						.then(function(setCookieResult) {

							var cookieId = setCookieResult.cookieId;
							res.cookie('cookieId', cookieId, { signed: true });

							if (link.type === C.Links.EmailConfirmation) {
								
								user.isFullUser = 1;
								user.email = link.pendingEmail;
								user.unconfirmedEmail = null;

								return Storage.Users.updateWithEmail(user)
								.then(function(result) {

									res.send(Filter.forClient(link, Filter.clientBlacklist.link));
									return;

								});

							} else if (link.type == C.Links.ResetPassword) {

								return Storage.Users.update(user)
								.then(function(result) {

									res.send(Filter.forClient(link, Filter.clientBlacklist.link));
									return;

								});

							} else {
								
								sendError(res, new ServerError(C.ErrorCodes.InvalidLink));
								return;

							}

						});

					});
					
				});

			})			
			.fail(function(err) {
				Log.e('Error in LINK READ', err, err.stack);
				sendError(res, err);
				return;
			})
			.end();
		};

		app.get('/' + path + '/:linkId', LinkRestApi.read);
		return LinkRestApi;
	};

	///////////////////////////////////////////////////////////////////////////////
	// ADMIN TOOLS
	///////////////////////////////////////////////////////////////////////////////
	var AdminTools = function(app) {
		var AdminTools = {};

		AdminTools.cleanTables = function(req, res) {

			Storage.AdminTools.cleanTables()
			.then(function(result) {
				sendSuccess(res, result);
				return;
			})
			.fail(function(err) {
				Log.e('Error in AdminTools.cleanTables', err, err.stack);
				sendError(res, err);
				return;
			})
			.end();

		};

		AdminTools.createGarbage = function(req, res) {

			Storage.AdminTools.createGarbage()
			.then(function(result) {
				sendSuccess(res, result);
				return;
			})
			.fail(function(err) {
				Log.e('Error in AdminTools.createGarbage', err, err.stack);
				sendError(res, err);
				return;
			})
			.end();

		};

		AdminTools.deleteUserByEmail = function(req, res) {

Log.l('Delete account for ', req.params.email);
			Storage.AdminTools.deleteUserByEmail(req.params.email)
			.then(function(result) {
				sendSuccess(res, result);
				return;
			})
			.fail(function(err) {
				Log.e('Error in AdminTools.deleteUserByEmail', err, err.stack);
				sendError(res, err);
				return;
			})
			.end();

		};

		app.get('/admin/clean_tables', AdminTools.cleanTables);
		app.get('/admin/delete_user_by_email/:email', AdminTools.deleteUserByEmail);
		// Let's disable this.
		//app.get('/admin/create_garbage', AdminTools.createGarbage);

		return AdminTools;
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
		var friendRestApi = FriendRestApi(app);	
		var adminTools = AdminTools(app);

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