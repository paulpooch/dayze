////////////////////////////////////////////////////////////////////////////////
// 
// CONFIG
//
////////////////////////////////////////////////////////////////////////////////
define(function() {

	var config = {};

	config.COOKIE_SECRET_HASH = '7G4Q0jRLP2DtCKIL28CGmSzsA2d8nu8u';
	config.COOKIE_MAX_AGE = 60480000000;

	config.DYNAMODB_CREDENTIALS = {
		accessKeyId: 'AKIAINHDEIZ3QVSHQ3PA', 
		secretAccessKey: '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'
	};
			
	config.OAUTH_CREDENTIALS = {
		google: {
			clientId: '495360231026.apps.googleusercontent.com'
		},
		facebook {

		},
		twitter {

		}
	};

	// Tables
	config.TABLE_USERS = 'DAYZE_USERS';

	return config;

});