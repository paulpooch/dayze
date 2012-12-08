///////////////////////////////////////////////////////////////////////////////
// ACCOUNT VIEW
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',
	
	'c',
	'text!templates/account_template.html',
	'filter',
	'logg'
], function(
	jQuery,
	_,
	Backbone,
	
	C,
	AccountTemplate,
	Filter,
	Log
) {

	var that,
		_appModel,
		_accountModel,
		_googleModel,
		_facebookModel,
		_$loginForm,
		_$createForm,
		_$userButton,
		_$userModal,
		_$userEmail,
		_$userPassword,
		_$loginButton,
		_$createButton,
		_$headerEls,
		_$googleButton,
		_$facebookButton;

	var AccountView = Backbone.View.extend({

		template: _.template(AccountTemplate),

		render: function() {
			var data = that.model.toJSON();
			that.$el.html(that.template(data));
		},

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
			'click #user_button': 'onUserButtonClick',
			'click #google_button': 'onGoogleButtonClick',
			'click #facebook_button': 'onFacebookButtonClick',
			'click #login_button' : 'onLoginButtonClick',
			'click #create_account_button': 'onCreateAccountButtonClick',
			'click #show_login_button': 'onShowLoginButtonClick',
			'click #show_create_button': 'onShowCreateButtonClick',
			'change input': 'syncForm',
			'change textarea': 'syncForm',
		},

		syncForm: function(e) {
			var target = $(e.currentTarget);
      		var data = {};
      		data[target.attr('id')] = target.val();
      		console.log(data);
      		that.model.set(data);
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
				that.makeButtonStateLoading(_$loginButton);
				_appModel.createAccount();
			}
		},

		onCreateAccountButtonClick: function() {
			if (_$createForm.data('filter-passed')) {
				that.makeButtonStateLoading(_$createButton);
				_appModel.createAccount();
			}
		},

		onShowLoginButtonClick: function() {
			_$createForm.hide();
			_$loginForm.show();
		},

		onShowCreateButtonClick: function() {
			_$loginForm.hide();
			_$createForm.show();
		},

		makeButtonStateLoading: function($btn) {
			$btn.text($btn.data('loading-text'));
			$btn.attr('disabled', true);
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

	    onAccountCreated: function() {
			_$loginButton.button('loading');
	    },

	    initialize: function (options) {
	    	Log.l('init');
			that = this;
			_.bindAll(that);
	        that.render();

	        _appModel = options.appModel;
	        _accountModel = that.model;
	        _googleModel = that.model.get('googleModel');
	        _facebookModel = that.model.get('facebookModel');

	        _$createForm = that.$el.find('#create_form');
	        _$loginForm = that.$el.find('#login_form');
	        _$userButton = that.$el.find('#user_button');
	        _$userModal = that.$el.find('#user_modal');
	        _$userEmail = that.$el.find('#user_email');
	        _$userPassword = that.$el.find('#user_password');
	        _$loginButton = that.$el.find('#login_button');
	        _$createButton = that.$el.find('#create_account_button');
   	        _$googleButton = that.$el.find('#google_button');
   	        _$facebookButton = that.$el.find('#facebook_button');
	        _$headerEls = $('.account_view_header');

	        Filter.activate(_$createForm);

	        // BINDINGS
	        _appModel.bind('change:activeView', that.onActiveViewChange);

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

			_$userModal.bind('show', that.onUserModalShow);
			_$userModal.bind('hide', that.onUserModalHide);

	    }

	   
	});

	return AccountView;

});
