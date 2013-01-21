////////////////////////////////////////////////////////////////////////////////
// 
// LOGG
//
////////////////////////////////////////////////////////////////////////////////
define([
	'fs',
	'log', // The 'log' package.  Hence why this is called logg.
	'util', // Not our Utils.  Built in node util. http://nodejs.org/api/util.html
	'config'
], function(
	FileSystem,
	Logger,
	Util,
	Config
) {

	var Log = {};

	var now = new Date();
	var writeFlags = { flags: 'a' };
	var logName = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + '.log';
	var logFile = new Logger('debug', FileSystem.createWriteStream('./logs/' + logName, writeFlags));
	var errorLog = new Logger('debug', FileSystem.createWriteStream('./logs/exceptions.log', writeFlags));
	
	// This will roll-over log name when day changes.
	setInterval(function() {
		var newDate = new Date();
		if (newDate.getDate() != now.getDate()) {
			// Re-initiate Log
			now = new Date();
			logName = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + '.log';
			logFile = new Logger('debug', FileSystem.createWriteStream('../logs/' + logName, writeFlags));
		}
	}, Config.INTERVAL_LOG_RENAME);

	Log.l = function() {
		var text = [];
		var len = arguments.length;
		for (var i = 0; i < len; i++) {
			if (typeof arguments[i] == 'string') {
				text.push(arguments[i]);
			} else {
				text.push(Util.inspect(arguments[i]));
			}
		}
		var out = text.join(' ');
		console.log(out);
		logFile.log(out);
	};

	Log.e = function() {
		var text = [];
		var len = arguments.length;
		for (var i = 0; i < len; i++) {
			if (typeof arguments[i] == 'string') {
				text.push(arguments[i]);
			} else {
				text.push(Util.inspect(arguments[i]));
			}
		}
		var out = text.join(' ');
		console.error(out);
		errorLog.error(out);
	};

	Log.i = function() {
		var text = [];
		var len = arguments.length;
		for (var i = 0; i < len; i++) {
			if (typeof arguments[i] == 'string') {
				text.push(arguments[i]);
			} else {
				text.push(Util.inspect(arguments[i]));
			}
		}
		var out = text.join(' ');
		console.info(out);
		errorLog.info(out);
	};

	Log.w = function() {
		var text = [];
		var len = arguments.length;
		for (var i = 0; i < len; i++) {
			if (typeof arguments[i] == 'string') {
				text.push(arguments[i]);
			} else {
				text.push(Util.inspect(arguments[i]));
			}
		}
		var out = text.join(' ');
		console.warn(out);
		errorLog.warn(out);
	};

	return Log;

});