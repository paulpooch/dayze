////////////////////////////////////////////////////////////////////////////////
// 
// CONFIG
//
////////////////////////////////////////////////////////////////////////////////
define(function() {

	var Config = {};

	Config.COOKIE_SECRET_HASH = '7G4Q0jRLP2DtCKIL28CGmSzsA2d8nu8u';
	Config.COOKIE_MAX_AGE = 60480000000;

	Config.DYNAMODB_CREDENTIALS = {
		accessKeyId: 'AKIAINHDEIZ3QVSHQ3PA', 
		secretAccessKey: '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'
	};
			
	Config.OAUTH_CREDENTIALS = {
		google: {
			clientId: '495360231026.apps.googleusercontent.com'
		},
		facebook: {

		},
		twitter: {

		}
	};

	// Tables
	Config.TABLE_USERS = 'DAYZE_USERS';

	return Config;

});