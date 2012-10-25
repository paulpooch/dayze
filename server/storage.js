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

		Cache.get = function(key) {
			if (Config.IS_LOCAL_DEV) {
				var deferred = Q.defer();
				deferred.reject(new Error(key + ' was not in cache.'));
				return deferred.promise;
			} else {
				return Q.ncall(
					Memcached.get,
					this,
					key
				);
			}
		};

		Cache.set = function(key, value, lifetime) {
			if (Config.IS_LOCAL_DEV) {
				var deferred = Q.defer();
				deferred.reject(new Error(key + ' could not be saved to cache.'));
				return deferred.promise;
			} else {
				return Q.ncall(
					Memcached.set,
					this,
					key,
					value,
					lifetime
				);
			}
		};

		Cache.delete = function(key, callback) {
			if (Config.IS_LOCAL_DEV) {
				var deferred = Q.defer();
				deferred.reject(new Error(key + ' could not be deleted from cache.'));
				return deferred.promise;
			} else {
				return Q.ncall(
					Memcached.del,
					this,
					key
				);
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
			var deferred = Q.defer();

			var checkForConflictingEvents = function(event) {
				var hash = user.userId;
			 	var range = eventTime;

			 	return Q.ncall(
			 		ddb.getItem,
			 		this,
			 		Config.TABLE_EVENTS_BY_USERID_AND_TIME,
			 		hash,
			 		range,
			 		{}
			 	);

			};

			var saveEventsByUserIdAndTime = function(eventsEntry) {
				return Q.ncall(
					ddb.putItem,
					this,
					Config.TABLE_EVENTS_BY_USERID_AND_TIME,
					eventsEntry,
					{}
				);
			};

			var saveEvent = function(event) {
				return Q.ncall(
					ddb.putItem,
					this,
					Config.TABLE_EVENTS,
					event,
					{}
				);
			};

			var eventId = Uuid.v4();
			var eventTime = Utils.makeISOWithDayAndTime(post.dayCode, post.beginTime);

			var event = {
				eventId: eventId,
				eventTime: eventTime,
				name: post.name,
				dayCode: post.dayCode,
				description: post.description,
				location: post.location,
				beginTime: post.beginTime,
				endTime: post.endTime
			};

			checkForConflictingEvents(event)
			.then(function(eventsByUserIdAndTime) {
				
				console.log(eventsByUserIdAndTime);
				var existingEvents = eventsByUserIdAndTime.events;
				console.log(existingEvents);
				var eventArr = [];
				if (existingEvents) {
					eventArr.push(existingEvents);
				}
				eventArr.push(event.eventId);

				var eventsEntry = {
					userId: user.userId,
					eventTime: eventTime,
					events: eventArr
				};

				saveEventsByUserIdAndTime(eventsEntry)
				.then(function(result) {
					console.log('event keys saved');
					console.log(result);
					
					saveEvent(event)
					.then(function(result) {
						console.log('event saved');
						console.log(result);
						deferred.resolve(true);
					})
					.end();

				})
				.end();

			})	
			.fail(function(err) {
				console.log(err);
				deferred.reject(err);
			})
			.end();

			return deferred.promise;

		};

		// BEGIN HERE... HOW DO WE QUERY CORRECTLY?
		Events.getEventsForMonth = function(user, monthCode) {
			console.log(3);
			var deferred = Q.defer();

			var pullEventIds = function(userId, monthCode) {
				
				console.log(6);
				var options = {
					RangeKeyCondition: {
						ComparisonOperator: 'BETWEEN',
						AttributeValueList: [
							'1994-11-05T13:15:30Z',
							'2100-11-05T13:15:30Z'
						]
					}
				};

				return Q.ncall(
					ddb.query,
					this,
					Config.TABLE_EVENTS_BY_USERID_AND_TIME,
					userId,
					options
				);

			};

			Storage.Cache.get(Config.PRE_MONTH_EVENTS_FOR_USER + user.userId + monthCode)
			.then(function(events) {
				console.log(4);
				deferred.resolve(events);
			})
			.fail(function(err) {
				console.log(5);
				pullEventIds(user.userId, monthCode)
				.then(function(events) {
					console.log(7);
					console.log(events);
					deferred.resolve(events);
				})
				.fail(function(err) {
					console.log(err);
					deferred.reject(err);
				})
				.end();

			})
			.end();

			return deferred.promise;
		};

		return Events;

	})();

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
			
			Storage.Cache.get(Config.PRE_USER_WITH_COOKIE + cookieId)
			.then(function(user) {
				deferred.resolve(user);
			})
			.fail(function(err) {
				getUserIdWithCookieId(cookieId)
				.then(getUserWithUserId)
				.then(function(user) {
					user = user[0];
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

		return Users;

	})();

	return Storage;

});