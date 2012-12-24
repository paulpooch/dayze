require.config({
	// The shim config allows us to configure dependencies for
	// scripts that do not call define() to register a module
	shim: {
		'underscore': {
			exports: '_'
		},
		'backbone': {
			deps: [
				'underscore',
				'jquery'
			],
			exports: 'Backbone'
		},
		'bootstrap': {
			deps: [
				'jquery'
			]
		},
		'plugins': {
			deps: [
				'jquery'
			]
		},
		'jqueryui': {
			deps: [
				'jquery'
			]
		}
	},
	paths: {
		jquery: 'vendor/jquery/jquery.min',
		jqueryui: 'vendor/jquery/jquery-ui.min',
		underscore: 'vendor/underscore/underscore.min',
		backbone: 'vendor/backbone/backbone.min',
		text: 'vendor/require/text',
		modernizr: 'vendor/modernizr/modernizr',
		bootstrap: 'vendor/bootstrap/bootstrap',
		plugins: 'plugins',
		async: 'vendor/async/async',
		google: 'google',
		validator: 'vendor/validator/validator.min',
		logg: 'logg_shim',
		editable: 'vendor/editable/bootstrap-editable-inline.min'
	}
});

require(['app_client', 'test_registry', 'c'], function(App, TestRegistry, C) {
	window.Dayze = new App(true);

	// http://addyosmani.com/blog/unit-testing-backbone-js-apps-with-qunit-and-sinonjs/
	function runTests() {

// Note: Your test code is allowed to suck.
// By all means put minimal effort in.
///////////////////////////////////////////////////////////////////////////////


module('Login');
var $form = $('#login_form');
/*
test('invalid email', function() {
	$('#controls_login_button').click();
	$form.find('#loginEmail').val('thisisfake@fake.com');
	$form.find('#loginPassword').val('654654a');
	$form.find('#login_button').click();
	var $groups = $form.find('.control-group');
	for (var i = 0; i < 3; i++) {
		var grp = $groups.eq(i);
		equal(grp.attr('class'), 'control-group success');
	}
	var $feedback = $form.find('.feedback_message');
	stop(); // Pause the test 
    setTimeout(function() {
       equal($feedback.text(), C.Errors[C.ErrorCodes.AccountLoginEmail].message);
       // Restart the test
       start();
    }, 1000);
});

test('invalid password', function() {
	$form.find('#loginEmail').val('paul.pucciarelli@gmail.com');
	$form.find('#loginPassword').val('654654a');
	$form.find('#login_button').click();
	var $feedback = $form.find('.feedback_message');
	stop();
    setTimeout(function() {
	equal($feedback.text(), C.Errors[C.ErrorCodes.AccountLoginPassword].message);
       start();
    }, 1000);
});

test('login success', function() {
	$form.find('#loginEmail').val('paul.pucciarelli@gmail.com');
	$form.find('#loginPassword').val('654654');
	$form.find('#login_button').click();
	var $feedback = $form.find('.feedback_message');
	stop();
    setTimeout(function() {
		equal($feedback.text(), C.Errors[C.ErrorCodes.AccountLoginPassword].message);
       start();
    }, 1000);

	//TestRegistry['AccountControlsView'].hideUserModal();
});
*/

// This sends out email and fills up DB so maybe don't run all the time.

module('Create Account');
var $form = $('#create_form');	
test('create account filter', function() {


	$('#controls_create_account_button').click();
	$form.find('#unconfirmedEmail').val('abc');
	$form.find('#create_account_button').click();
	var err = $form.find('.help-inline').text();
	var grp = $form.find('#unconfirmedEmail').parents('.control-group');
	equal(grp.attr('class'), 'control-group error');
	equal(err, C.FilterErrors.Email);

});
test('create account success', function() {

	$form.find('#unconfirmedEmail').val('paul.pucciarelli@gmail.com');
	$form.find('#create_account_button').click();
	var err = $form.find('.help-inline').text();
	var grp = $form.find('#unconfirmedEmail').parents('.control-group');
	equal(grp.attr('class'), 'control-group success');
	equal(err, '');
	TestRegistry['AccountControlsView'].hideUserModal();

});

///////////////////////////////////////////////////////////////////////////////
	}
	setTimeout(runTests, 2000);
});