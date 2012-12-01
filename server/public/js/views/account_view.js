///////////////////////////////////////////////////////////////////////////////
// ACCOUNT VIEW
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',
	
	'c',
	'text!templates/account_template.html',
], function(
	jQuery,
	_,
	Backbone,
	
	C,
	AccountTemplate
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
			'click #create_account_button': 'onCreateAccountButtonClick',
			'click #login_button': 'onLoginButtonClick',
			'click #create_button': 'onCreateButtonClick',
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

		onCreateAccountButtonClick: function() {console.log('dfdsfsdf');
			_appModel.createAccount();
		},

		onLoginButtonClick: function() {
			if (_$loginForm.is(':visible')) {
				_$loginButton.button('loading');
			} else {
				_$createForm.hide();
				_$loginForm.show();
			}
		},

		onCreateButtonClick: function() {
			if (_$createForm.is(':visible')) {
				_$loginButton.button('loading');
			} else {
			_$loginForm.hide();
			_$createForm.show();
			}
		},
		///////////////////////////////////////////////////////////////////////

		// MODEL EVENTS ///////////////////////////////////////////////////////
		onActiveViewChange: function() {
			if (_appModel.get('activeView') == C.ActiveViews.Account) {
				_$headerEls.show();	
				that.doUiTweaks();
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
   	        _$facebookButton = that.$el.find('#facebook_button');
	        _$headerEls = $('.account_view_header');

	        // BINDINGS
	        //that.model.on('change', that.render);
	        _appModel.bind('change:activeView', that.onActiveViewChange);
			_$userModal.bind('show', that.onUserModalShow);
			_$userModal.bind('hide', that.onUserModalHide);

			_facebookModel.bind('change:isLoggedIn', function(facebook) {
				if (_facebookModel.get('isLoggedIn')) {
					_$facebookButton.html('Log out of Facebook');
				} else {
					_$facebookButton.html('Sign in with Facebook');
				}
			});

	    }

	   
	});

	return AccountView;

});
