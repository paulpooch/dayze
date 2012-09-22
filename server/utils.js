////////////////////////////////////////////////////////////////////////////////
// 
// UTILS
//
////////////////////////////////////////////////////////////////////////////////
define(['q'], function(Q) {

	var Utils = {};

	Utils.log = console.log;

  	Utils.getNowIso = function() {
  		return (new Date().toISOString());
  	};

  	Utils.generatePassword = function(pLength, pLevel) {
		var length = (typeof pLength == 'undefined') ? 32 : pLength;
		var level = (typeof pLevel == 'undefined') ? 3 : pLevel;
		var validChars = [
			'', // Level 0 undefined. 
			'0123456789abcdfghjkmnpqrstvwxyz',
			'0123456789abcdfghjkmnpqrstvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
			'0123456789_!@#$%*()-=+abcdfghjkmnpqrstvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
		];
		var password = '';
		var counter = 0;
		while (counter < length) {
			var rand = Math.round(Math.random() * (validChars[level].length - 1));
			var oneChar = validChars[level].substr(rand, 1);
			password += oneChar;
			counter++;
		}
		return password;
	};

  	return Utils;

});