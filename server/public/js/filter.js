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
		Log.l('CLEAN ////////////////////////////');
		Log.l('DIRTY', req.body, req.query);
		var cleaned = {};
		var passed = true;
		var fields = Filter.fields[action];
		for (var i = 0; i < fields.length; i++) {
			var field = fields[i];
			var name = field.name;
			var rules = field.rules;
			var dirtyVal = (req.query && req.query[name]) || (req.body && req.body[name]);
			for (var j = 0; j < rules.length; j++) {
				var rule = rules[j];
				var ruleResult = rule(dirtyVal);
				Log.l(ruleResult, 'ruleresult');
				if (!ruleResult.passed) {
		 			passed = false;
		 		}
		 		var cleanVal = ruleResult.cleanVal;
			}
			cleaned[name] = cleanVal;
			Log.l('cleaned', cleaned);
			if (field.required && !cleanVal) {
				passed = false;
				cleaned[name] = null;
			}
			if (field.immutable && cleanVal != dirtyVal) {
				passed = false;
				cleaned[name] = null;
			}
		}
		Log.l('CLEAN', cleaned);
		return { passed: passed, cleaned: cleaned };
	};

	Filter.rules = {};

	Filter.rules.email = function(t) {
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
