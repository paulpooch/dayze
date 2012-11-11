////////////////////////////////////////////////////////////////////////////////
// 
// CONFIG
//
////////////////////////////////////////////////////////////////////////////////
define(function() {

	var Config = {};

	// Dev flag.
	Config.IS_LOCAL_DEV = true;
	Config.RUN_TESTS = false;

	Config.PORT = 8000;

	Config.DEFAULT_USER_NAME = 'Anonymous';

	// To use AWS Elasticache:
	//this.CACHE_URL = 'cache-001.ardkb4.0001.use1.cache.amazonaws.com:11211',
	// To use local EC2 box (cheaper):
	Config.CACHE_URL = 'localhost:11211',
	Config.INTERVAL_LOG_RENAME = 1800000; // 30 minutes

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

	return Config;

});