/////////////////////////////////////////////////////////////////////////////////////////
// SERVER ERRORS
/////////////////////////////////////////////////////////////////////////////////////////
define([
	'c',
	'config'
], function(
	C,
	Config
) {

	var ServerError = function(error) {

		if (typeof error == 'number') {
			var error = C.Errors[error];
			if (error.code == C.ErrorCodes.Filter) {
				this.code = error.code;
				this.httpCode = error.httpCode;
				this.action = arguments[1];
				this.message = arguments[2];
			} else {
				// Our custom errors
				this.code = error.code;
				this.httpCode = error.httpCode;
				this.message = error.message;
			}
		} else {
			// Error from external source. - Some other lib or unknown failure.	
			this.code = C.ErrorCodes.External;
			this.httpCode = C.HttpCodes.GenericServerError
			if (Config.IS_LOCAL_DEV) {
				this.message = JSON.stringify(error);
				this.stackTrace = error.stack || null;	
			} else {
				this.message = C.Errors[C.ErrorCodes.External].message;
			}
		}
	};

	ServerError.prototype.toString = function() {
		JSON.stringify(this);
		/*
		return '##### SERVER ERROR #####\n' + 
		(this.code || '') + '\n' + 
		(this.action || '') + '\n' + 
		(this.message || '') + '\n' + 
		(this.stackTrace || '');
		*/
	};

	return ServerError;

});
