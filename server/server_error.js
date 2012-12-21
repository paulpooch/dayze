/////////////////////////////////////////////////////////////////////////////////////////
// SERVER ERRORS
/////////////////////////////////////////////////////////////////////////////////////////
define([
	'c'
], function(
	C
) {

	var ServerError = function(error) {

		if (typeof error == 'number') {
			var error = C.Errors[error];
			if (error.code == C.ErrorCodes.Filter) {
				this.code = error.code;
				this.action = arguments[1];
				this.message = arugments[2];
			} else {
				// Our custom errors
				this.code = error.code;
				this.message = error.message;
			}
		} else {
			// Error from external source. - Some other lib or unknown failure.	
			this.code = C.ErrorCodes.External;
			this.message = JSON.stringify(error);
			this.stackTrace = error.stack || null;
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
