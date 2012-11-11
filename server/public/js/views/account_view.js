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
		_$userButton,
		_$userModal,
		_$userEmail,
		_$userPassword,
		_$headerEls;

	var AccountView = Backbone.View.extend({

		template: _.template(AccountTemplate),

		render: function () {
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
			// https://developers.google.com/accounts/docs/OAuth2Login
			var endpoint = 'https://accounts.google.com/o/oauth2/auth';
			var params = {
				client_id: '495360231026.apps.googleusercontent.com',
				response_type: 'token',
				redirect_uri: 'http://localhost:8000/oauth',
				scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar',
				state: ''
			};
			window.location = endpoint + '?' + $.param(params);
		},

		onFacebookButtonClick: function() {
			var facebook = _appModel.getFacebook();
			facebook.login();
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
	    	_.bindAll(this);
			that = this;

			_appModel = options.appModel;

	        that.render();

	        _$userButton = this.$el.find('#user_button')
	        _$userModal = this.$el.find('#user_modal');
	        _$userEmail = this.$el.find('#user_email');
	        _$userPassword = this.$el.find('#user_password');
	        _$headerEls = $('.account_view_header');

	        // BINDINGS
	        //that.model.on('change', that.render);
	        _appModel.bind('change:activeView', that.onActiveViewChange);
			_$userModal.bind('show', that.onUserModalShow);
			_$userModal.bind('hide', that.onUserModalHide);

	    },

	   
	});

	return AccountView;

});