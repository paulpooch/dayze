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
		Users.resetTable = function() {

			// remove, pause, create.
			var create = function() {
				var deferred = Q.defer();
				ddb.createTable(Config.TABLE_USERS, {
					hash: ['userId', ddb.schemaTypes().string]
				}, {
					read: 10, 
					write: 10
				}, function(err, details) {
					if (err) {
						deferred.reject(new Error(err));
					} else {
						deferred.resolve(details);
					}
				});
				return deferred.promise;
			};

			var remove = function() {
				var deferred = Q.defer();
				ddb.deleteTable(Config.TABLE_USERS, function(err, details) {
					if (err) {
						//deferred.reject(err);
						deferred.resolve(err);
					} else {
						deferred.resolve(details);
					}
				});
				return deferred.promise;
			};

			remove()
			.then(function(details) {
				console.log('Users table deleted.  Waiting before re-creating.');
				console.log(details);
			})
			.delay(20000)
			.then(create)
			.then(function(details) {
				console.log('Users table created.');
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
					deferred.reject(new Error(err));
				} else {
					console.log('createTempUser successful.', res, cap);
					var result = {
						cookieId: cookieId,
						user: user
					};
					console.log(result.cookieId, result.user);
					deferred.resolve(result);
				}
			});

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