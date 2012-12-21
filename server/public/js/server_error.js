/////////////////////////////////////////////////////////////////////////////////////////
// SERVER ERRORS
/////////////////////////////////////////////////////////////////////////////////////////
define([], function() {

	var ServerErrors = function(code, message) {
		this.errors = [];
		this.addError(code, message);
	};

	ServerErrors.prototype.addError = function(code, message) {
		this.errors.push({ code: code, message: message });
	};

	return ServerError;

});
