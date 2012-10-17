////////////////////////////////////////////////////////////////////////////////
// 
// STORAGE
//
// https://github.com/teleportd/node-dynamodb/blob/master/lib/ddb.js
//
////////////////////////////////////////////////////////////////////////////////
define([
	'dynamodb',
	'config',
	'utils',
	'node-uuid',
	'q'
], function(
	DynamoDB,
	Config,
	Utils,
	Uuid,
	Q
) {

	var Storage = {};
	var ddb = DynamoDB.ddb(Config.DYNAMODB_CREDENTIALS);

	///////////////////////////////////////////////////////////////////////////
	// Events
	///////////////////////////////////////////////////////////////////////////
	Storage.Events = (function() {

		var Events = {};

		Events.createEvent = function(userId, post) {
			
			var eventId = Uuid.v4();

			var event = {
				eventId: eventId,
				name: post.name,
				dayCode: post.dayCode,
				description: post.description,
				location: post.location,
				beginTime: post.beginTime,
				endTIme: post.endTIme
			};

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


		// This really needs memcache.
		Users.getUserWithCookieId = function(cookieId) {
			var deferred = Q.defer();

			// ddb.getItem(Config.TABLE_USERS_BY_COOKIE, cookieId, null, {}, function(err, res, cap) {
			// 	console.log(err, res, cap);
			// });

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

			getUserIdWithCookieId(cookieId)
			.then(getUserWithUserId)
			.then(function(res) {
				deferred.resolve(res);
			})
			.fail(function(err) {
				deferred.reject(new Error(err));
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