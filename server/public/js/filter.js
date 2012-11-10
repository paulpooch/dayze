////////////////////////////////////////////////////////////////////////////////
// 
// FILTER
//
// From a security standpoint sharing this onto the clientside is a horrible idea.
// So this better be bulletproof.
//
////////////////////////////////////////////////////////////////////////////////
define([
	'logg'
], function(
	Log
) {

	var Filter = {};

	Filter.approve = function(req, action) {
		var cleaned = {};
		var passed = true;
		var fields = Filter.fields[action];
		for (var field in fields) {
			var name = field.name;
			var rules = fields.rules;
			var ruleResult = rules.call(req[name]);
		 	if (!ruleResult.passed) {
		 		passed = false;
		 		break;
		 	} else {
		 		cleaned[name] = ruleResult.cleaned;
		 	}
		}
		return { passed: passed, cleaned: cleaned };
	};

	Filter.rules = {};
	Filter.rules.email = function() {
		var t = this;

		console.log('filtering email on ', t);
		
		return { passed: true, cleaned: t };
	};

	Filter.fields = {
		'account.create': [{ 
			name: 'createAccountEmail',
			rules: [Filter.rules.email],
			mustPass: true
		}]
	};

	return Filter;

});
