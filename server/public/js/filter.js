////////////////////////////////////////////////////////////////////////////////
// 
// FILTER
//
// From a security standpoint sharing this onto the clientside is a horrible idea.
// So this better be bulletproof.
//
// https://github.com/chriso/node-validator
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
	var Validator = Validator || {};

	// If client
	if (typeof window != 'undefined' && window.document) {
		require(['jquery'], function ($) {
			// $ exists now if we're on the client.
		});
		Validator.check = check;
		Validator.sanitize = sanitize;
	}

	// FILTER RULES ///////////////////////////////////////////////////////////
	/*
	Returns an object of {
		passed: true or false
		error: error message
		clean: sanitized field
	}
	*/
	Filter.rules = {};

	Filter.rules.monthCode = function(t) {
		var msg = 'monthCode must be a valid YYYY-MM-DD format.';
		var result = { passed: true, cleanVal: false, error: msg };
		try {
			Validator.check(t).is(/^[0-9]{4}|-|(0[123456789]|10|11|12)$/);
			result.cleanVal = t;
		} catch(e) {
			result.passed = false;
		}
		return result;
	};

	Filter.rules.email = function(t) {
		var msg = 'Email must be a valid email between 1 and 100 characters long.';
		var result = { passed: true, cleanVal: false, error: msg };
		try {
			t = Validator.sanitize(t).xss().trim();
			Validator.check(t).isEmail().len(1, 100);
			result.cleanVal = t;
		} catch (e) {
			result.passed = false;
		}
		return result;
	};

	Filter.rules.password = function(t) {
		return { passed: true, cleanVal: t, errors: false };
	};

	Filter.rules.boolean = function(t) {
Log.l('boolean filter', t);
		var msg = 'Invalid boolean value.';
		var result = { passed: true, cleanVal: false, error: msg };
		try {
			t = Validator.sanitize(t).toBooleanStrict();
			result.cleanVal = t;
		} catch (e) {
			result.passed = false;
		}
		return result;
	};

	// Keep this in sync with Utils.generateCustomLink
	Filter.rules.linkId = function(t) {
		var msg = 'Invalid linkId.';
		var result = { passed: true, cleanVal: false, error: msg };
		try {
			t = Validator.sanitize(t).xss().trim();
			Validator.check(t).is(/^[abcdefghjkmnpqrstuvwxyz0123456789]{30}$/);
			result.cleanVal = t;
		} catch (e) {
			result.passed = false;
		}
		return result;
	};

	Filter.rules.action = function(t) {
		var msg = 'Invalid action.';
		var result = { passed: false, cleanVal: false, error: msg };
		var validActions = {
			create_account: 1
		};
		if (validActions.hasOwnProperty(t)) {
			result.passed = true;
			result.cleanVal = t;
		}
		return result;
	};
	
	// FILTER FIELDS //////////////////////////////////////////////////////////

	Filter.fields = {
		'link.read': [{
			name: 'id',
			rules: [ Filter.rules.linkId ],
			immutable: true,
			required: true
		}],
		'event.list': [{
			name: 'monthCode',
			rules: [ Filter.rules.monthCode	],
			immutable: true,
			required: true
		}],
		'account.update': [{ 
			name: 'createAccountEmail',
			rules: [ Filter.rules.email	],
			immutable: true,
			required: true
		}, {
			name: 'isBeingCreated',
			rules: [ Filter.rules.boolean],
			immutable: true,
			required: false,
			serverOnly: true
		}]
	};

	// For client, req is actually a jquery el containing all fields.
	Filter.clean = function(req, action, isClient) {
		Log.l('CLEAN ////////////////////////////');
		Log.l('action', action);
		Log.l('DIRTY', req.body, req.query);
		var cleaned = {};
		var passed = true;
		var fields = Filter.fields[action];
		var errors = {};
		for (var i = 0; i < fields.length; i++) {
			var field = fields[i];
			var name = field.name;
			var rules = field.rules;
			if (isClient) {
				if (!field.serverOnly) {
					var $fieldEl = req.find('#' + name);
					if (!$fieldEl) {
Log.l('WARNING: field element ', name, ' not found in during client filter.');
					}
					var $controlGroup = $fieldEl.closest('.control-group');
					var $helpInline = $controlGroup.find('.help-inline');
					$controlGroup.attr('class', 'control-group'); // Reset class	
					$helpInline.text('');
					var dirtyVal = $fieldEl.val();
					for (var j = 0; j < rules.length; j++) {
						var rule = rules[j];
						var ruleResult = rule(dirtyVal);
						if (!ruleResult.passed) {
			 				passed = false;
			 				errors[name] = ruleResult.error;
							$controlGroup.addClass('error');
			 				$helpInline.text(ruleResult.error);
			 				break;
			 			} else {
			 				$controlGroup.addClass('success');
			 			}
			 			dirtyVal = ruleResult.cleanVal;
			 		}
			 		var cleanVal = ruleResult.cleanVal;
					cleaned[name] = cleanVal;
			 	}
			} else {
				var dirtyVal = (req.query && req.query[name]) || (req.body && req.body[name]) || (req.params && req.params[name]);
				for (var j = 0; j < rules.length; j++) {
					var rule = rules[j];
					var ruleResult = rule(dirtyVal);
					if (!ruleResult.passed) {
		 				passed = false;
		 				errors[name] = ruleResult.error;
		 				break;
					}
					dirtyVal = ruleResult.cleanVal;
		 		}
		 		var cleanVal = ruleResult.cleanVal;
				cleaned[name] = cleanVal;
			}
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

	Filter.activate = function($el) {
  		var action = $el.data('filter');
	  	var trigger = $el.data('filter-trigger');
	  	trigger = trigger.split(':');
	  	$el.on(trigger[0], '#' + trigger[1], function() {
	  		var result = Filter.clean($el, action, true);
	  		$el.data('filter-passed', result.passed);
	  	});
	};

	Filter.clientBlacklist = {};

	Filter.clientBlacklist.user = [
		'cookieId',
		'createTime',
		'passwordHash',
		'passwordSalt',
		'lastActivityTime'
	];

	Filter.clientBlacklist.link = [
		'isSingleUse',
		'createTime',
		'expiration',
		'used',
		'userId'
	];

	Filter.forClient = function(item, blacklist) {
		for (var i = 0; i < blacklist.length; i++) {
			var field = blacklist[i];
			if (item[field]) {
				delete item[field];
			}
		}
		return item;
	};

	return Filter;

});
