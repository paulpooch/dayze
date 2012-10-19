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

	Utils.makeISOWithDayAndTime = function(dayCode, time) {
		var dParts = dayCode.split('-');
		var tParts = time.split(' ');
		var amPm = time[1];
		tParts = tParts.split(':');

		var year = (dParts.length > 0) ? dParts[0] : null;
		var month = (dParts.length > 1) ? Number(dParts[1]) - 1 : null;
		var day = (dParts.length > 2) ? dParts[2] : null;

		var hour = (tParts.length > 0) ? tParts[0] : null;
		var minute = (tParts.length > 0) ? tParts[1] : 0;
		if (amPm == 'pm') {
			hour += 12;
		}

		if (year && month && day && hour) {
			return new Date(year, month, day, hour, minute).toISOString();
		} else {
			throw new Error('Utils.makeISOWithDayAndTime cannot parse dayCode=' + dayCode + ' time=' + time);
		}
	};

  	return Utils;

});