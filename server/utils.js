////////////////////////////////////////////////////////////////////////////////
// 
// UTILS
//
////////////////////////////////////////////////////////////////////////////////
define([
	'q',
	'crypto'
], function(
	Q,
	Crypto
) {

	var Utils = {};

  	Utils.getNowIso = function() {
  		return (new Date().toISOString());
  	};

  	Utils.generateCustomLink = function() {
		var validChars = 'abcdefghjkmnpqrstuvwxyz0123456789';
		var password = '';
		var counter = 0;
		var length = 30;
		while (counter < length) {
			var rand = Math.round(Math.random() * (validChars.length - 1));
			var oneChar = validChars.substr(rand, 1);
			password += oneChar;
			counter++;
		}
		return password;
  	}

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

	Utils.hashSha512 = function(text) {
		return Crypto.createHash('sha512').update(text).digest('base64');
	};

	Utils.makeISOWithDayAndTime = function(dayCode, time) {
		var dParts = dayCode.split('-');
		var year = (dParts.length > 0) ? Number(dParts[0]) : null;
		var month = (dParts.length > 1) ? Number(dParts[1]) - 1 : null;
		var day = (dParts.length > 2) ? Number(dParts[2]) : null;

		var tParts = time.split(':');
		var hour = Number(tParts[0]);
		var minute = ( tParts.length > 0 && tParts[1].length > 1 && Number(tParts[1].substr(0, 2)) ) || 0;
		var pm = ( tParts.length > 0 && tParts[1].toLowerCase().indexOf('pm') > -1 ) || false;
		if (pm) {
			hour += 12;
		}

		if (year != undefined && month != undefined && day != undefined && hour != undefined && minute != undefined) {
			return new Date(year, month, day, hour, minute).toISOString();
		} else {
			throw new Error('Utils.makeISOWithDayAndTime cannot parse dayCode=' + dayCode + ' time=' + time);
		}
	};

	Utils.makeMonthRange = function(monthCode) {
		var dParts = monthCode.split('-');
		var year = (dParts.length > 0) ? Number(dParts[0]) : null;
		var month = (dParts.length > 1) ? Number(dParts[1]) - 1 : null;
		var endMonth = (month == 11) ? 0 : month + 1;
		if (year != null && month != null) {
			return { 
				begin: new Date(year, month).toISOString(),
				end: new Date(year, endMonth).toISOString()
			};
		} else {
			throw new Error('Utils.makeMonthRange cannot parse monthCode=' + monthCode);
		}
	};

	Utils.removeEmptyStrings = function(obj) {
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				var val = obj[prop];
				if (val === '') {
					delete obj[prop];
				}
			}
		}
		return obj;
	};

  	return Utils;

});