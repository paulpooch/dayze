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

	var Logg = {};

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
			logFile = new Log('debug', FileSystem.createWriteStream('../logs/' + logName, writeFlags));
		}
	}, Config.INTERVAL_LOG_RENAME);

	Logg.l = function(what) {
		console.log(JSON.stringify(what));
		logFile.debug(JSON.stringify(what));
	};

	Logg.exception = function(what) {
		console.log(JSON.stringify(what));
		errorLog.debug(JSON.stringify(what));
	};

	Logg.e = function(what) {
		console.log(JSON.stringify(what));
		errorLog.debug(JSON.stringify(what));
	};

	Logg.i = function(what) {
		console.log(JSON.stringify(what));
		logFile.debug(JSON.stringify(what));
	};
	
	Logg.w = function(what) {
		console.log(JSON.stringify(what));
		logFile.debug(JSON.stringify(what));
	};

	return Logg;

});