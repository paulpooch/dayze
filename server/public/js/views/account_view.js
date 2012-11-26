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
		_facebookModel,
		_googleModel,
		_$userButton,
		_$userModal,
		_$userEmail,
		_$userPassword,
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
			'click #login_button': 'onCreateAccountButtonClick',
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
		},

 		onGoogleButtonClick: function() {
 			_googleModel.login();
		},

		onFacebookButtonClick: function() {
			var isLoggedIn = _facebookModel.get('isLoggedIn');
			if (isLoggedIn) {
				_facebookModel.logout();
			} else {
				_facebookModel.login();
			}
		},

		onCreateAccountButtonClick: function() {
			_appModel.createAccount();
		},

		onLoginButtonClick: function() {
      		that.model.set({});
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
	    	_$userButton.button('toggle');
        	setTimeout(function(){ _$userEmail.focus(); }, 500);
	    },

	    onUserModalHide: function() {
	    	_$userButton.button('toggle');
	    },
	    ///////////////////////////////////////////////////////////////////////

		oauth: function(response) {
			$.ajax({
	  			url:  'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + response.access_token,
				success: function(data) {
					console.log(data);
				    that.model.set('displayName', data.name);
				    fetchCalendars();
				}
			});

			var fetchCalendars = function() {
				$.ajax({
		  			url:  'https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token=' + response.access_token,
					success: function(data) {
						console.log(data);
					}
				});
			};
		},

	    initialize: function (options) {
			that = this;
			_.bindAll(that);

			_appModel = options.appModel;
			_facebookModel = _appModel.get('facebookModel');
			//_googleModel = _appModel.get('googleModel');
	        that.render();

	        _$userButton = this.$el.find('#user_button')
	        _$userModal = this.$el.find('#user_modal');
	        _$userEmail = this.$el.find('#user_email');
	        _$userPassword = this.$el.find('#user_password');
	        _$headerEls = $('.account_view_header');
	        _$facebookButton = this.$el.find('#facebook_button');

	        // BINDINGS
	        //that.model.on('change', that.render);
	        _appModel.bind('change:activeView', that.onActiveViewChange);
			_$userModal.bind('show', that.onUserModalShow);
			_$userModal.bind('hide', that.onUserModalHide);

			//_googleModel.bind('change:isLoggedIn', function() {

			//});

			_facebookModel.bind('change:isLoggedIn', function(facebook) {
				var isLoggedIn = facebook.get('isLoggedIn');
				console.log(isLoggedIn)
				if (isLoggedIn) {
					_$facebookButton.html('Log out of Facebook');
				} else {
					_$facebookButton.html('Sign in with Facebook');
				}
			});

	    }

	   
	});

	return AccountView;

});