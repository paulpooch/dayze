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
		_$userButton,
		_$feedbackLogin,
		_$feedbackCreate,
		_createAccountForm,
		_loginForm;

		/*
		_accountModel,
		_googleModel,
		_facebookModel,

		_$userEmail,
		_$userPassword,
		_$loginButton,

		_$googleButton,
		_$facebookButton,
		*/

	var AccountControlsView = Backbone.View.extend({

		template: _.template(AccountControlsTemplate),

		render: function() {
			var data = that.model.toJSON();
			that.$el.html(that.template(data));

			_$userModal = that.$el.find('#user_modal');
			_$createForm = that.$el.find('#create_form');
	        _$loginForm = that.$el.find('#login_form');
			_$userButton = that.$el.find('#user_button');
			_$userEmail = that.$el.find('#user_email');
			_$feedbackLogin = that.$el.find('.feedback_message_login');
			_$feedbackCreate = that.$el.find('.feedback_message_create');

			_createAccountForm = new SmartForm(that.model, _$createForm, _appModel.createAccount);
			_loginForm = new SmartForm(that.model, _$loginForm, _appModel.login);
			_$userModal.bind('show', that.onUserModalShow);
			_$userModal.bind('hide', that.onUserModalHide);
		},

		hideUserModal: function() {
			if (_$userModal) {
				_$userModal.modal('hide');
			}
		},

		handleError: function(error) {
			if (error.code == C.ErrorCodes.AccountLoginPassword || 
			error.code == C.ErrorCodes.AccountLoginEmail) {
				_$feedbackLogin.text(error.message);
				_loginForm.resetForm(false); // don't reset inputs
			} else if (error.code == C.ErrorCodes.AccountEmailTaken) {
				_$feedbackCreate.text(error.message);
				_createAccountForm.resetForm(true); // reset inputs
			}
		},

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
			'click #user_button': 'onUserButtonClick',
			'click #google_button': 'onGoogleButtonClick',
			'click #facebook_button': 'onFacebookButtonClick',
			'click #login_button' : 'onLoginButtonClick',
			'click #show_login_button': 'showLoginForm',
			'click #show_create_button': 'showCreateAccountForm',
			'click #controls_create_account_button': 'showCreateAccountForm',
			'click #controls_login_button': 'showLoginForm'
		},

		onUserButtonClick: function(event) {
	        _$userModal.modal('toggle');
			_$createForm.hide();
			_$loginForm.show();
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

		onLoginButtonClick: function() {
			if (_$loginForm.data('filter-passed')) {
				_appModel.login();
			}
		},

		showLoginForm: function() {
			_$userModal.modal('show');
			_$createForm.hide();
			_$loginForm.show();
		},

		showCreateAccountForm: function() {
			_$userModal.modal('show');
			_$loginForm.hide();
			_$createForm.show();
			setTimeout(function() {
				_$createForm.find('[data-focus=1]').focus();
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

	        // Don't do shit like this.
	        // These dom els are reset every render.
	        // And we re-render whenever user logs in and shit.
	        /*
	        _accountModel = that.model;
	        _googleModel = that.model.get('googleModel');
	        _facebookModel = that.model.get('facebookModel');
	        _$userPassword = that.$el.find('#user_password');
	        _$loginButton = that.$el.find('#login_button');
   	        _$googleButton = that.$el.find('#google_button');
   	        _$facebookButton = that.$el.find('#facebook_button');
	        _$headerEls = $('.account_view_header');
	        
	        
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
			*/

	    }

	   
	});

	return AccountControlsView;

});
