////////////////////////////////////////////////////////////////////////////////
// 
// CONFIG
//
////////////////////////////////////////////////////////////////////////////////
define(function() {

	var Config = {};

	Config.REST_PREFIX = 'rest/'

	Config.COOKIE_SECRET_HASH = '7G4Q0jRLP2DtCKIL28CGmSzsA2d8nu8u';
	Config.COOKIE_MAX_AGE = 60480000000;

	Config.DYNAMO_DEFAULT_READ_PER_SEC = 5;
	Config.DYNAMO_DEFAULT_WRITE_PER_SEC = 5;


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
	Config.TABLE_USERS_BY_COOKIE = 'DAYZE_USERS_BY_COOKIE';

	return Config;

});