////////////////////////////////////////////////////////////////////////////////
// 
// CONFIG - SERVER SIDE CONSTANTS
//
////////////////////////////////////////////////////////////////////////////////
define(function() {

	var Config = {};

	// Dev flag.
	Config.IS_LOCAL_DEV = true;
	Config.URL_ROOT = Config.IS_LOCAL_DEV ? '//localhost:8000/' : '//daypaint.co/'; // Protocol-less.
	Config.RUN_TESTS = false;

	Config.PORT = 8000;

	// To use AWS Elasticache:
	//this.CACHE_URL = 'cache-001.ardkb4.0001.use1.cache.amazonaws.com:11211',
	// To use local EC2 box (cheaper):
	Config.CACHE_URL = 'localhost:11211',
	Config.INTERVAL_LOG_RENAME = 1800000; // 30 minutes

	Config.REST_PREFIX = 'rest/'

	Config.COOKIE_SECRET_HASH = '7G4Q0jRLP2DtCKIL28CGmSzsA2d8nu8u';
	Config.COOKIE_MAX_AGE = 60480000000;

	Config.DYNAMO_DEFAULT_READ_PER_SEC = 2;
	Config.DYNAMO_DEFAULT_WRITE_PER_SEC = 2;
	Config.DYNAMO_SCAN_CHUNK_SIZE = 20;
	Config.DYNAMO_BATCH_DELAY = 1000;
	Config.DYNAMODB_CREDENTIALS = {
		accessKeyId: 'AKIAINHDEIZ3QVSHQ3PA', 
		secretAccessKey: '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'
	};
	// For aws-sdk.
	Config.AWS_ACCESS_KEY_ID = 'AKIAINHDEIZ3QVSHQ3PA';
	Config.AWS_SECRET_ACCESS_KEY = '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';

	Config.EMAIL_FROM_ADDRESS = 'daypaint@gmail.com';

	Config.LINK_TYPE_EMAIL_CONFIRMATION = 'email_confirmation';
	Config.LINK_EXPIRATION_EMAIL_CONFIRMATION = 7; // days

	return Config;

});