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

	Filter.clean = function(req, action) {
		var cleaned = {};
		var passed = true;
		var fields = Filter.fields[action];
		for (var field in fields) {
			if (fields.hasOwnProperty(field)) {
				var name = field.name;
				var rules = fields.rules;
				var cleanVal = req[name];
				for (var rule in rules) {
					if (rules.hasOwnProperty(rule)) {
						var ruleResult = rules.call(cleanVal);
						if (!ruleResult.passed) {
			 				passed = false;
			 			}
			 			cleanVal = ruleResult.cleanVal;
					}
				}
				cleaned[name] = cleanVal
				if (field.required && !cleanVal) {
					passed = false;
					cleaned[name] = null;
				}
				if (field.immutable && cleanVal != req[name]) {
					passed = false;
					cleaned[name] = null;
				}
			}
		}
		return { passed: passed, cleaned: cleaned };
	};

	Filter.rules = {};

	Filter.rules.email = function() {
		var t = this;
		console.log('filtering email on ', t);
		return { passed: true, cleanVal: t };
	};

	Filter.fields = {
		'account.create': [{ 
			name: 'createAccountEmail',
			rules: [
				Filter.rules.email
			],
			immutable: true, // TODO: do something with these
			required: true
		}]
	};

	return Filter;

});
