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

	var storage = {};
	var ddb = DynamoDB.ddb(Config.DYNAMODB_CREDENTIALS);

	///////////////////////////////////////////////////////////////////////////
	// Users
	///////////////////////////////////////////////////////////////////////////
	storage.Users = (function() {
	
		var users = {};

		// Users.resetTable ///////////////////////////////////////////////////
		users.resetTable = function() {

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
		users.createTempUser = function() {

			var cookieId = Utils.generatePassword(20);
			var userId = Uuid.v4();

			var user = { 
				userId: userId,
				cookieId: cookieId,
				displayName: '',
				passwordHash: '',
				passwordSalt: '',
				createTime: Utils.getNowIso()
			};

			ddb.putItem(Config.TABLE_USERS, user, {}, function(err, res, cap) {
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log('createTempUser successful.', res, cap);
					return {
						cookieId: cookieId,
						user: user
					};
				}
			});

		};
		
		return users;

	})();

	return storage;

});