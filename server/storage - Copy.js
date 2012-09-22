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
	// Users
	///////////////////////////////////////////////////////////////////////////
	Storage.Users = (function() {
	
		var Users = {};

		// Users.resetTable ///////////////////////////////////////////////////
		Users.resetTables = function() {

			var createUsersTable = function() {
				var deferred = Q.defer();
				ddb.createTable(Config.TABLE_USERS, {
					hash: ['userId', ddb.schemaTypes().string]
				}, {
					read: Config.DYNAMO_DEFAULT_READ_PER_SEC, 
					write: Config.DYNAMO_DEFAULT_WRITE_PER_SEC
				}, function(err, details) {
					if (err) {
						deferred.reject(new Error(err));
					} else {
						deferred.resolve(details);
					}
				});
				return deferred.promise;
			};

			var removeUsersTable = function() {
				var deferred = Q.defer();
				ddb.deleteTable(Config.TABLE_USERS, function(err, details) {
					if (err) {
						// We're ok with it not deleting... maybe it didn't exist.
						deferred.resolve(err);
					} else {
						deferred.resolve(details);
					}
				});
				return deferred.promise;
			};

			var createUsersByCookieTable = function() {
				var deferred = Q.defer();
				ddb.createTable(Config.TABLE_USERS_BY_COOKIE, {
					hash: ['cookieId', ddb.schemaTypes().string]
				}, {
					read: Config.DYNAMO_DEFAULT_READ_PER_SEC, 
					write: Config.DYNAMO_DEFAULT_WRITE_PER_SEC
				}, function(err, details) {
					if (err) {
						deferred.reject(new Error(err));
					} else {
						deferred.resolve(details);
					}
				});
				return deferred.promise;
			};

			var removeUsersByCookieTable = function() {
				var deferred = Q.defer();
				ddb.deleteTable(Config.TABLE_USERS_BY_COOKIE, function(err, details) {
					if (err) {
						// We're ok with it not deleting... maybe it didn't exist.
						deferred.resolve(err);
					} else {
						deferred.resolve(details);
					}
				});
				return deferred.promise;
			};

			removeUsersTable()
			.then(function(details) {
				console.log('Users table deleted.  Waiting before re-creating.');
				console.log(details);
			})
			.delay(20000)
			.then(createUsersTable)
			.then(function(details) {
				console.log('Users table created.');
				console.log(details);
			})

			.then(removeUsersByCookieTable)
			.then(function(details) {
				console.log('UsersByCookie deleted.  Waiting before re-creating.');
				console.log(details);
			})
			.delay(20000)
			.then(createUsersByCookieTable)
			.then(function(details) {
				console.log('UsersByCookie table created.');
				console.log(details);
			})
			
			.fail(function(err) {
				console.log(err);
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
						console.log(result.cookieId, result.user);
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
				deferred.resolve(putUserResult);
			})
			.end();
			

			return deferred.promise;
		};


		Users.getUserFromCookie = function(cookieId) {
			var deferred = Q.defer();
			var options = {
				filter: {
					cookieId: {
						eq: cookieId
					}
				}
			};
			ddb.scan(Config.TABLE_USERS, options, function(err, res) {
				if (err) {
					deferred.reject(new Error(err));
				} else {
					deferred.resolve(res);
				}
			});
			return deferred.promise;
		};


		return Users;

	})();

	return Storage;

});