////////////////////////////////////////////////////////////////////////////////
// 
// STORAGE
//
////////////////////////////////////////////////////////////////////////////////
define([
	'dynamodb',
	'config',
	'utils'
], function(
	DynamoDB,
	Config,
	Utils
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

		return users;

	})();

	return storage;

});