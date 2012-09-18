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
	'node-uuid'
], function(
	DynamoDB,
	Config,
	Utils,
	Uuid
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
				ddb.createTable(Config.TABLE_USERS, {
					hash: ['userId', ddb.schemaTypes().string]
				}, {
					read: 10, 
					write: 10
				}, function(err, details) {
					console.log(err, details);
				});
			};
			var remove = function() {
				ddb.deleteTable(Config.TABLE_USERS, function(err, tableDetails) {
					if (err) {
						console.log(err);
					} else {
						console.log('Users table deleted.  Waiting before re-creating.')
						Utils.sleep(20, function() {
							create();
						});
					}
				});
			};
			remove();
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