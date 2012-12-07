////////////////////////////////////////////////////////////////////////////////
// 
// FILTER
//
// From a security standpoint sharing this onto the clientside is a horrible idea.
// So this better be bulletproof.
//
////////////////////////////////////////////////////////////////////////////////
define([
	'logg', // will be logg_shim if on client
	'validator'
], function(
	Log,
	Validator
) {

	var Filter = {};

	// If client
	if (typeof window != 'undefined' && window.document) {
		require(['jquery'], function ($) {

		});
	}

	// If server?
	if (Validator) {
		var check = Validator.sanitize;
		var sanitize = Validator.sanitize;
	}

	Filter.clean = function(req, action) {
		Log.l('CLEAN ////////////////////////////');
		Log.l('DIRTY', req.body, req.query);
		var cleaned = {};
		var passed = true;
		var fields = Filter.fields[action];
		var errors = {};
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
		 			errors[name] = ruleResult.errors;
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
		return { passed: passed, cleaned: cleaned, errors: errors };
	};

	Filter.rules = {};

	Filter.rules.email = function(t) {
		var msg = 'Email must be a valid email between 1 and 100 characters long.';
		var result = { passed: true, error: msg };
		var clean = false;
		try {
			check(t).isEmail().len(1, 100);
			clean = sanitize(t).trim().xss();
		} catch (e) {
			result.passed = false;
		}
		result.cleanVal = clean;
		return result;
	};

	Filter.rules.password = function(t) {
		return { passed: true, cleanVal: t, errors: false };
	};

	Filter.rules.boolean = function(t) {
		return { passed: true, cleanVal: t, errors: false };
	};
	
	Filter.fields = {
		'account.create': [{ 
			name: 'createAccountEmail',
			rules: [ Filter.rules.email	],
			immutable: true, // TODO: do something with these
			required: true
		}],
		'account.login': [{
			name: 'loginEmail',
			rules: [ Filter.rules.email	],
			immutable: true,
			required: true
		}, {
			name: 'loginPassword',
			rules: [ Filter.rules.password ],
			immutable: true,
			required: true
		}, {
			name: 'loginRemember',
			rules: [ Filter.rules.boolean ],
			immutable: true,
			required: false
		}]
	};

	Filter.activate = function($el) {
  		var action = $el.data('filter');
	  	console.log(action);
	  	return true;
	};

	return Filter;

});
