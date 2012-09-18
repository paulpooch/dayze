////////////////////////////////////////////////////////////////////////////////
// 
// CONFIG
//
////////////////////////////////////////////////////////////////////////////////
define(function() {

	var config = {};

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