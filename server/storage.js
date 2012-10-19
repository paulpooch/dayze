////////////////////////////////////////////////////////////////////////////////
// 
// STORAGE
//
// https://github.com/teleportd/node-dynamodb/blob/master/lib/ddb.js
//
////////////////////////////////////////////////////////////////////////////////
define([
	'dynamodb',
	'node-uuid',
	'q',
	'memcached',

	'config',
	'utils',
	'logg'
], function(
	DynamoDB,
	Uuid,
	Q,
	Memcached,

	Config,
	Utils,
	Logg
) {

	var Storage = {};
	var ddb = DynamoDB.ddb(Config.DYNAMODB_CREDENTIALS);
	var Memcached = new Memcached(Config.CACHE_URL);

	///////////////////////////////////////////////////////////////////////////
	// Cache
	///////////////////////////////////////////////////////////////////////////
	Storage.Cache = (function() {

		var Cache = {};

		Memcached.on('issue', function(issue) {
			Logg.e('Issue occured on server ' + issue.server + ', ' + issue.retries  + 
			' attempts left untill failure');
		});
		
		Memcached.on('failure', function(issue) {
			Logg.e(issue.server + ' failed!');
		});
		
		Memcached.on('reconnecting', function(issue) {
			Logg.e('reconnecting to server: ' + issue.server + ' failed!');
		});

		Cache.get = function(key, callback) {
			if (Config.IS_LOCAL_DEV) {
				callback(new Error());
			} else {
				Memcached.get(key, function(err, result) {
					if (err) {
						Logg.e(err);
						callback(new Error('Cache.get could not get ' + key));	
					} else {
						callback(null, result);
					}
				});
			}
		};

		Cache.set = function(key, value, lifetime, callback) {
			if (Config.IS_LOCAL_DEV) {
				callback(new Error());
			} else {
				Memcached.set(key, value, lifetime, function(err, result) {
					if (err) {
						Logg.e(err);
						callback(new Error('Cache.set could not set ' + key));
					} else {
						// This will be true if successful.
						callback(null, result);
					}
				});
			}
		};
		
		Cache.delete = function(key, callback) {
			if (Config.IS_LOCAL_DEV) {
				callback(new Error());
			} else {
				Memcached.del(key, function(err, result) {
					if (err) {
						Logg.e(err);
						callback(new Error('Cache.delete could not delete ' + key));
					} else {
						callback(null, result);
					}
				});
			}
		};

		return Cache;

	})();


	///////////////////////////////////////////////////////////////////////////
	// Events
	///////////////////////////////////////////////////////////////////////////
	Storage.Events = (function() {

		var Events = {};

		Events.createEvent = function(user, post) {
			
			var eventId = Uuid.v4();
			var eventTime = Utils.makeISOWithDayAndTime(dayCode, post.beginTime);
			console.log(eventTime);

			var event = {
				eventId: eventId,
				name: post.name,
				dayCode: post.dayCode,
				description: post.description,
				location: post.location,
				beginTime: post.beginTime,
				endTIme: post.endTIme
			};

			// var checkForConflictingEvents = function(post) {
			// 	var hash = user.userId;
			// 	var range = dayCode beginTime;


			// }



			// 1. Get any events matching userId + time in TABLE_EVENTS_BY_USERID_AND_TIME
			// 2. treat as array.
			// 3. push new eventId to array, or create new array for it.
			// 4. Add event to TABLE_EVENTS
			// 5. Add eventId array to TABLE_EVENTS_BY_USERID_AND_TIME


			// var step1 = Q.ncall(
			// 	ddb.query,
			// 	this,
			// 	Config.TABLE_EVENTS_BY_USERID_AND_TIME,


			// 	)

			// var step5 = Q.ncall(
			// 	ddb.putItem,
			// 	this,
			// 	Config.TABLE_EVENTS,
			// 	event,
			// 	{}
			// );

			// var step2 = return Q.ncall(
			// 		ddb.getItem,
			// 		this,
			// 		Config.TABLE_USERS_BY_COOKIE,
			// 		cookieId,
			// 		null,
			// 		{}
			// 	);

		};

	});

	///////////////////////////////////////////////////////////////////////////
	// Users
	///////////////////////////////////////////////////////////////////////////
	Storage.Users = (function() {
	
		var Users = {};

		// Users.resetTable ///////////////////////////////////////////////////
		Users.resetTables = function() {

			var createUsersTable = function() {
				return Q.ncall(
					ddb.createTable,
					this,
					Config.TABLE_USERS,
					{
						hash: ['userId', ddb.schemaTypes().string]
					},
					{
						read: Config.DYNAMO_DEFAULT_READ_PER_SEC, 
						write: Config.DYNAMO_DEFAULT_WRITE_PER_SEC
					}
				);
			};

			var removeUsersTable = function() {
				return Q.ncall(
					ddb.deleteTable,
					this,
					Config.TABLE_USERS
				);
			};

			var createUsersByCookieTable = function() {
				return Q.ncall(
					ddb.createTable,
					this,
					Config.TABLE_USERS_BY_COOKIE, 
					{
						hash: ['cookieId', ddb.schemaTypes().string]
					},
					{
						read: Config.DYNAMO_DEFAULT_READ_PER_SEC, 
						write: Config.DYNAMO_DEFAULT_WRITE_PER_SEC
					}
				);
			};

			var removeUsersByCookieTable = function() {
				return Q.ncall(
					ddb.deleteTable,
					this,
					Config.TABLE_USERS_BY_COOKIE
				);
			};

			
			removeUsersTable()
			.then(function(res) {
				console.log('Users table removed.');
				console.log(res);
			})
			.delay(60000)

			.then(createUsersTable)
			.then(function(res) {
				console.log('Users table created.');
				console.log(res);
			})
			.delay(10000)
			
			.then(removeUsersByCookieTable)
			.then(function(res) {
				console.log('UsersByCookie table removed.');
				console.log(res);
			})
			.delay(60000)
			
			.then(createUsersByCookieTable)
			.then(function(res) {
				console.log('UsersByCookie table created.');
				console.log(res);
			})

			.fail(function(err) {
				console.log('Error.', err);
			})
			.end();

			
		};

		// Users.createTempUser
		Users.createTempUser = function() {
			var deferred = Q.defer();

			var cookieId = Utils.generatePassword(20, 2);
			var userId = Uuid.v4();

			
			var putUser = function() {
				var def1 = Q.defer();

				var user = { 
					userId: userId,
					cookieId: cookieId,
					isRegistered: 0,
					//displayName: '',
					//passwordHash: '',
					//passwordSalt: '',
					createTime: Utils.getNowIso()
				};


				ddb.putItem(Config.TABLE_USERS, user, {}, function(err, res, cap) {
					if (err) {
						console.log(err);
						def1.reject(new Error(err));
					} else {
						console.log('putUser successful.', res, cap);
						var result = {
							cookieId: cookieId,
							user: user
						};
						console.log(result.cookieId, result.user);
						def1.resolve(result);
					}
				});

				return def1.promise;
			};

			var putCookie = function(putUserResult) {
				var def2 = Q.defer();

				var cookie = {
					cookieId: putUserResult.cookieId,
					userId: putUserResult.user.userId
				};

				ddb.putItem(Config.TABLE_USERS_BY_COOKIE, cookie, {}, function(err, res, cap) {
					if (err) {
						console.log(err);
						def2.reject(new Error(err));
					} else {
						console.log('putCookie successful.', res, cap);
						console.log(cookie.cookieId, cookie.user);
						def2.resolve(putUserResult);
					}
				});

				return def2.promise;

			};

			putUser()
			.then(putCookie)
			.then(function(putUserResult) {
				deferred.resolve(putUserResult);
			})
			.fail(function(err) {
				deferred.reject(new Error(err));
			})
			.end();
			
			return deferred.promise;
		};

		Users.getUserWithCookieId = function(cookieId) {
			var deferred = Q.defer();

			// ddb.getItem(Config.TABLE_USERS_BY_COOKIE, cookieId, null, {}, function(err, res, cap) {
			// 	console.log(err, res, cap);
			// });

			var checkCache = function(cookieId) {
				return Q.ncall(
					Storage.Cache.get,
					this,
					Config.PRE_USER_WITH_COOKIE + cookieId
				);
			};

			var setCache = function(cookieId, user) {
				return Q.ncall(
					Storage.Cache.set,
					this,
					Config.PRE_USER_WITH_COOKIE + cookieId,
					user,
					Config.TIMEOUT_USER_WITH_COOKIE
				);
			}

			var getUserIdWithCookieId = function(cookieId) {
				return Q.ncall(
					ddb.getItem,
					this,
					Config.TABLE_USERS_BY_COOKIE,
					cookieId,
					null,
					{}
				);
			};

			var getUserWithUserId = function(res) {
				return Q.ncall(
					ddb.getItem,
					this,
					Config.TABLE_USERS,
					res[0].userId,
					null,
					{}
				);
			};

			checkCache(cookieId)
			.then(function(user) {
				deferred.resolve(user);
			})
			.fail(function(err) {
				getUserIdWithCookieId(cookieId)
				.then(getUserWithUserId)
				.then(function(user) {
					setCache(cookieId, user)
					.then(function(setResult) {
						deferred.resolve(user);
					})
					.fail(function(err) {
						deferred.resolve(user);
					})
					.end();
				})
				.fail(function(err) {
					deferred.reject(new Error(err));
				})
				.end();
			})
			.end();

			return deferred.promise;
		};

		/* SCAN EXAMPLE			
		var options = {
			filter: {
				cookieId: {
					eq: cookieId
				}
			}
		};
		ddb.scan(Config.TABLE_USERS_BY_COOKIE, options, function(err, res) {
			if (err) {
				deferred.reject(new Error(err));
			} else {
				deferred.resolve(res);
			}
		});
		*/

		return Users;

	})();

	return Storage;

});