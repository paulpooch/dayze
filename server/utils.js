////////////////////////////////////////////////////////////////////////////////
// 
// UTILS
//
////////////////////////////////////////////////////////////////////////////////
define(function() {

	var utils = {};

	utils.sleep = function(seconds, callback) {
		var startTime = new Date().getTime();
		while (new Date().getTime() < startTime + (seconds * 1000));
		callback();
  	};

  	utils.getNowISO = function() {
  		return (new Date().toISOString());
  	};

  	return utils;

});