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
		var result = { passed: true, cleanVal: null, error: msg };
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
		var result = { passed: true, cleanVal: null, error: msg };
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
		var msg = 'Password must be at least 5 characters long.';
		var result = { passed: true, cleanVal: null, error: msg };
		try {
			Validator.check(t).len(5, 100);
			result.cleanVal = t;
		} catch (e) {
			result.passed = false;
		}
		return result;
	};

	Filter.rules.boolean = function(t) {
		var msg = 'Invalid boolean value.';
		var result = { passed: true, cleanVal: null, error: msg };
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
		var result = { passed: true, cleanVal: null, error: msg };
		try {
			t = Validator.sanitize(t).xss().trim();
			Validator.check(t).is(/^[abcdefghjkmnpqrstuvwxyz0123456789]{30}$/);
			result.cleanVal = t;
		} catch (e) {
			result.passed = false;
		}
		return result;
	};

	Filter.rules.uuid = function(t) {
		var msg = 'Invalid UUID.';
		var result = { passed: true, cleanVal: null, error: msg };
		try {
			t = Validator.sanitize(t).xss().trim();
			Validator.check(t).isUUID();
			result.cleanVal = t;
		} catch (e) {
			result.passed = false;
		}
		return result;
	};

	Filter.rules.action = function(t) {
		var msg = 'Invalid action.';
		var result = { passed: false, cleanVal: null, error: msg };
		var validActions = {
			create_account: 1
		};
		if (validActions.hasOwnProperty(t)) {
			result.passed = true;
			result.cleanVal = t;
		}
		return result;
	};

	Filter.rules.alpha = function(t) {
		var msg = 'Value must be 1 to 100 alphabetic characters.';
		var result = { passed: true, cleanVal: null, error: msg };
		try {
			t = Validator.sanitize(t).xss().trim();
			Validator.check(t).isAlpha().len(1, 100);
			result.cleanVal = t;
		} catch (e) {
			result.passed = false;
		}
		return result;
	};

	// http://www.regular-expressions.info/posixbrackets.html
	// Allows hex 20 -> hex 7E of http://www.asciitable.com/
	Filter.rules.displayName = function(t) {
		var msg = 'Display name must be 3 or more printable characters.';
		var result = { passed: true, cleanVal: null, error: msg };
		try {
			t = Validator.sanitize(t).xss().trim();
			Validator.check(t).is(/^[\x20-\x7E]{3,}$/); // 3 or more printable chars.
			result.cleanVal = t;
		} catch(e) {
			result.passed = false;
		}
		return result;
	};
	
	// FILTER FIELDS //////////////////////////////////////////////////////////

	// Regular forms.
	Filter.fields = {
		'link.read': [{
			name: 'linkId',
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
		'account.list': [{
			name: 'id',
			rules: [ Filter.rules.uuid ],
			immutable: true,
			required: false
		}],
		'account.createAccount': [{ 
			name: 'unconfirmedEmail',
			rules: [ Filter.rules.email	],
			immutable: true,
			required: true
		}, {
			name: 'state',
			rules: [ Filter.rules.alpha ],
			immutable: true,
			required: true,
			serverOnly: true
		}],
		'account.login': [{
			name: 'state',
			rules: [ Filter.rules.alpha ],
			immutable: true,
			required: true,
			serverOnly: true
		}, {
			name: 'loginPassword',
			rules: [ Filter.rules.password ],
			immutable: true,
			required: true
		}, {
			name: 'loginEmail',
			rules: [ Filter.rules.email	],
			immutable: true,
			required: true
		}, {
			name: 'loginRemember',
			rules: [ Filter.rules.boolean ],
			immutable: true,
			required: false
		}],
		'account.initialPwSet': [{
			name: 'password',
			rules: [ Filter.rules.password ],
			immutable: true,
			required: true
		}],
		'account.patch': [{
			name: 'password',
			rules: [ Filter.rules.password ],
			immutable: true,
			required: false,
			serverOnly: true
		}, {
			name: 'unconfirmedEmail',
			rules: [ Filter.rules.email	],
			immutable: true,
			required: false,
			serverOnly: true
		}, {
			name: 'displayName',
			rules: [ Filter.rules.displayName	],
			immutable: true,
			required: false,
			serverOnly: true
		}]
	};

	// Will require a matching patch filter above.
	// Probably could be combined.
	// See how things shake out first.
	Filter.hotFields = {
		'displayName': {
			rules: [ Filter.rules.displayName ],
			immutable: true
		},
		'unconfirmedEmail': {
			rules: [ Filter.rules.email ],
			immutable: true
		},
		'password': {
			rules: [ Filter.rules.password ],
			immutable: true
		}
	};

	Filter.cleanHotField = function(name, newVal, $fieldEl) {
		var passed = true;
		var error = null;
		var field = Filter.hotFields[name];
		if (!field) {
			return { passed: false, cleaned: null, errors: { Filter: 'Filter.hotFields had no entry for fieldName: ' + name } };
		}
		var rules = field.rules;
		var $controlGroup = $fieldEl.closest('.control-group');
		var $helpInline = $fieldEl.siblings('.help-inline');
		$controlGroup.attr('class', 'control-group'); // Reset class	
		$helpInline.text('');
		var dirtyVal = newVal;
		var origVal = newVal;
		for (var i = 0; i < rules.length; i++) {
			var rule = rules[i];
			var ruleResult = rule(dirtyVal);
			if (!ruleResult.passed) {
				passed = false;
			 	error = ruleResult.error;
				$controlGroup.addClass('error');
			 	$helpInline.text(ruleResult.error);
			 	break;
			 } else {
			 	$controlGroup.addClass('success');
			 }
			 dirtyVal = ruleResult.cleanVal;
		}
		var cleanVal = ruleResult.cleanVal;
		if (field.immutable && cleanVal != origVal) {
			passed = false;
			cleanVal = null;
		}
		return { passed: passed, cleaned: cleanVal, errors: error };
	};	

	// For client, req is actually a jquery el containing all fields.
	Filter.clean = function(req, action, isClient) {
		Log.l('CLEAN ////////////////////////////');
		Log.l('action', action);

		var allCleaned = {};
		var allErrors = {};
		var allPassed = true;
		var filterFields = Filter.fields[action];

		if (!filterFields) {
			return { 
				passed: false,
				cleaned: null,
				errors: { Filter: 'Filter.fields had no entry for action: ' + action } 
			};
		}

		for (var i = 0; i < filterFields.length; i++) {
			var filterField = filterFields[i];
			var fieldName = filterField.name;
			var fieldRules = filterField.rules;
			
			if (isClient) {
				if (!filterField.serverOnly) {

					// CLIENTSIDE FILTER //////////////////////////////////////
					var dirtyVal = null;
					var fieldFailed = false;
					var $fieldEl = req.find('#' + fieldName);
					if (!$fieldEl) {
Log.l('WARNING: filterField element ', fieldName, ' not found in during client filter.');
						allPassed = false;
						allErrors[fieldName] = fieldName + ' had no corresponding form element.';
					}

					var $controlGroup = $fieldEl.closest('.control-group');
					var $helpInline = $fieldEl.siblings('.help-inline');
					// Reset error/success messages.
					$controlGroup.attr('class', 'control-group');
					$helpInline.text('');
					
					if ($fieldEl.attr('type') == 'checkbox') {
						dirtyVal = $fieldEl.is(':checked');
					} else {
						dirtyVal = $fieldEl.val();
					}
					var originalVal = dirtyVal;
					
					for (var j = 0; j < fieldRules.length; j++) {
						var fieldRule = fieldRules[j];
						var ruleResult = fieldRule(dirtyVal);
						if (!ruleResult.passed && filterField.required) {
							fieldFailed = true;
			 				allErrors[fieldName] = ruleResult.error;
			 				break;
			 			}
			 			dirtyVal = ruleResult.cleanVal;
			 		}
			 		var cleanVal = ruleResult.cleanVal;
					allCleaned[fieldName] = cleanVal;

					if (!fieldFailed && filterField.required && (typeof cleanVal == 'undefined' || cleanVal == undefined)) {
						fieldFailed = true;
						allErrors[fieldName] = fieldName + ' was required but not defined.';
					}
Log.l('immutalbe?', cleanVal, originalVal);
					if (!fieldFailed && filterField.immutable && cleanVal != originalVal) {
						fieldFailed = true;
						allErrors[fieldName] = fieldName + ' was immutable and could only pass the filter with modification.';
					}
			 		if (fieldFailed) {
			 			allPassed = false;
			 			allCleaned[fieldName] = null;
			 			$helpInline.text(allErrors[fieldName]);
			 			$controlGroup.addClass('error');
			 		} else {
			 			$controlGroup.addClass('success');
			 		}

			 	}
			} else {
				//(req.params) Checks route params, ex: /user/:id
				//(req.query) Checks query string params, ex: ?id=12 Checks urlencoded body params
				//(req.body), ex: id=12 To utilize urlencoded request bodies, req.body should be an object. This can be done by using the _express.bodyParser middleware.

				// SERVERSIDE FILTER //////////////////////////////////////////
				var fieldFailed = false;
				var dirtyVal = null;
				if (req.body && req.body.hasOwnProperty(fieldName)) {
					dirtyVal = req.body[fieldName];
				}
				if (req.params && req.params.hasOwnProperty(fieldName)) {
					dirtyVal = req.params[fieldName];
				}
				if (req.query && req.query.hasOwnProperty(fieldName)) {
					dirtyVal = req.query[fieldName];
				}
			
				var originalVal = dirtyVal;
				for (var j = 0; j < fieldRules.length; j++) {
					var fieldRule = fieldRules[j];
					var ruleResult = fieldRule(dirtyVal);
					if (!ruleResult.passed && filterField.required) {
						fieldFailed = true;
						allErrors[fieldName] = ruleResult.error;
						break;
			 		}
			 		dirtyVal = ruleResult.cleanVal;
			 	}
			 	var cleanVal = ruleResult.cleanVal;
				allCleaned[fieldName] = cleanVal;

				if (!fieldFailed && filterField.required && (typeof cleanVal == 'undefined' || cleanVal == undefined)) {
					fieldFailed = true;
					allErrors[fieldName] = fieldName + ' was required but not defined.';
				}
				if (!fieldFailed && filterField.immutable && cleanVal != originalVal) {
					fieldFailed = true;
					allErrors[fieldName] = fieldName + ' was immutable and could only pass the filter with modification.';
				}
			 	if (fieldFailed) {
			 		allPassed = false;
			 		allCleaned[fieldName] = null;
				}
			}
		}
Log.l('Cleaned = ', allCleaned);
		return { passed: allPassed, cleaned: allCleaned, errors: allErrors };
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
			if (item.hasOwnProperty(field)) {
				delete item[field];
			}
		}
		return item;
	};

	return Filter;

});
