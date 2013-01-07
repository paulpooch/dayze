///////////////////////////////////////////////////////////////////////////////
// ACCOUNT VIEW
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',
	
	'c',
	'text!templates/account_controls_template.html',
	'filter',
	'logg',
	'smart_form',
	'test_registry'
], function(
	jQuery,
	_,
	Backbone,
	
	C,
	AccountControlsTemplate,
	Filter,
	Log,
	SmartForm,
	TestRegistry
) {

	var that,
		_appModel,
		_$headerEls,
		_$createForm,
		_$userModal,
		_$loginForm,
		_$createForm,
		_$forgotForm,
		_$userButton,
		_$feedbackLogin,
		_$feedbackCreate,
		_$feedbackForgot,
		_createAccountForm,
		_loginForm,
		_forgotForm,
		_accountModel,
		_googleModel,
		_facebookModel,

		_$userEmail,

		_$googleButton,
		_$facebookButton;

	var AccountControlsView = Backbone.View.extend({

		template: _.template(AccountControlsTemplate),

		render: function() {
			var data = that.model.toJSON();
			that.$el.html(that.template(data));

			_$userModal = that.$el.find('#user_modal');
			_$createForm = that.$el.find('#create_form');
	        _$loginForm = that.$el.find('#login_form');
			_$forgotForm = that.$el.find('#forgot_form');
			_$userButton = that.$el.find('#user_button');
			_$userEmail = that.$el.find('#user_email');
			_$feedbackLogin = that.$el.find('.feedback_message_login');
			_$feedbackCreate = that.$el.find('.feedback_message_create');
			_$feedbackForgot = that.$el.find('.feedback_message_reset');
   	        _$googleButton = that.$el.find('#google_button');
   	        _$facebookButton = that.$el.find('#facebook_button');

	        _accountModel = that.model;
	        _googleModel = that.model.get('googleModel');
	        _facebookModel = that.model.get('facebookModel');

			_createAccountForm = new SmartForm(that.model, _$createForm, _appModel.createAccount);
			_loginForm = new SmartForm(that.model, _$loginForm, _appModel.login);
			_forgotForm = new SmartForm(that.model, _$forgotForm, _appModel.forgotPassword);
			_$userModal.bind('show', that.onUserModalShow);
			_$userModal.bind('hide', that.onUserModalHide);

			_googleModel.bind('change:isLoggedIn', function() {
				if (_googleModel.get('isLoggedIn')) {
					_$googleButton.html('Log out of Google');
				} else {
					_$facebookButton.html('Use Google');
				}
	        });

			_facebookModel.bind('change:isLoggedIn', function(facebook) {
				if (_facebookModel.get('isLoggedIn')) {
					_$facebookButton.html('Log out of Facebook');
				} else {
					_$facebookButton.html('Use Facebook');
				}
			});
		},

		hideUserModal: function() {
			if (_$userModal) {
				_$userModal.modal('hide');
			}
		},

		handleError: function(error) {
			if (error.code == C.ErrorCodes.AccountLoginPassword || 
			error.code == C.ErrorCodes.AccountLoginPartialAccount ||
			error.code == C.ErrorCodes.AccountLoginEmail) {
				_$feedbackLogin.text(error.message);
				_loginForm.resetForm(false); // don't reset inputs
			} else if (error.code == C.ErrorCodes.AccountEmailTaken) {
				_$feedbackCreate.text(error.message);
				_createAccountForm.resetForm(true); // reset inputs
			} else if (error.code == C.ErrorCodes.AccountForgotNoAccount) {
				_$feedbackForgot.text(error.message);
				_forgotForm.resetForm(true);
			}
		},

		handleForgotPasswordSuccess: function() {
			_$feedbackForgot.html(C.Strings.ResetPassword(that.$el.find('#forgotEmail').val()));
			that.$el.find('#forgotEmail').closest('.control-group').hide();
			that.$el.find('#forgot_button').hide();
			that.$el.find('#forgot_done_button').fadeIn();
		},

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
			'click #user_button': 'onUserButtonClick',
			'click #google_button': 'onGoogleButtonClick',
			'click #facebook_button': 'onFacebookButtonClick',
			'click #show_login_button': 'showLoginForm',
			'click #show_create_button': 'showCreateAccountForm',
			'click #controls_create_account_button': 'showCreateAccountForm',
			'click #controls_login_button': 'showLoginForm',
			'click #forgot_password': 'showForgotPasswordForm',
			'click #forgot_done_button': 'hideUserModal'
		},

		onUserButtonClick: function(event) {
	        that.hideUserModal();
	        _appModel.routeAccount();
	    },

 		onGoogleButtonClick: function() {
 			_googleModel.login();
		},

		onFacebookButtonClick: function() {
			if (_facebookModel.get('isLoggedIn')) {
				_facebookModel.logout();
			} else {
				_facebookModel.login();
			}
		},

		showLoginForm: function() {
			that.render();
			_$userModal.modal('show');
			_$forgotForm.hide();
			_$createForm.hide();
			_$loginForm.fadeIn();
			setTimeout(function() {
				_$loginForm.find('[data-focus=1]').focus();
			}, 500);
		},

		showCreateAccountForm: function() {
			that.render();
			_$userModal.modal('show');
			_$forgotForm.hide();
			_$loginForm.hide();
			_$createForm.fadeIn();
			setTimeout(function() {
				_$createForm.find('[data-focus=1]').focus();
			}, 500);
		},

		showForgotPasswordForm: function() {
			_$loginForm.hide();
			_$forgotForm.fadeIn();
			setTimeout(function() {
				_$forgotForm.find('[data-focus=1]').focus();
			}, 500);
		},
		///////////////////////////////////////////////////////////////////////

		// MODEL EVENTS ///////////////////////////////////////////////////////
		onActiveViewChange: function() {
			if (_appModel.get('activeView') == C.ActiveViews.Account) {
				_$headerEls.show();	
				_isActiveView = true;
			} else {
				_$headerEls.hide();
				_isActiveView = false;
			}
		},

		onUserModalShow: function() {
        	setTimeout(function(){ _$userEmail.focus(); }, 500);
	    },

	    onUserModalHide: function() {
	    	_$userButton.button('toggle');
	    },
	    ///////////////////////////////////////////////////////////////////////

	    initialize: function (options) {
			that = this;
			_.bindAll(that);
			TestRegistry['AccountControlsView'] = that;

	        _appModel = options.appModel;
	        _$headerEls = $('.account_view_header');

			// BINDINGS
	        _appModel.bind('change:activeView', that.onActiveViewChange);
	    }

	   
	});

	return AccountControlsView;

});