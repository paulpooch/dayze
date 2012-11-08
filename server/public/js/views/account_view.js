///////////////////////////////////////////////////////////////////////////////
// ACCOUNT VIEW
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',

	'text!templates/account_template.html',
], function(
	jQuery,
	_,
	Backbone,
	
	AccountTemplate
) {

	var that,
		_userButton,
		_userModal,
		_userEmail,
		_userPassword;

	var AccountView = Backbone.View.extend({

		template: _.template(AccountTemplate),

		render: function () {
			var data = that.model.toJSON();
			that.$el.html(that.template(data));
		},

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
			'click #user_button': 'toggleModal',
			'click #google_button': 'googleSignIn'
		},
		///////////////////////////////////////////////////////////////////////

		// MODEL EVENTS ///////////////////////////////////////////////////////

		///////////////////////////////////////////////////////////////////////

		toggleModal: function(event) {
			_userModal.modal('toggle');
		},

		oauth2Callback: function(response) {
			var that = this;
			$.ajax({
	  			url:  'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + response.access_token,
				success: function(data) {
					console.log(data);
				    that.model.set('displayName', data.name);
				    dog();
				}
			});

			function dog() {
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

	    	var options = options || {};
	        this.model.on('change', this.render, this);
	        this.render();

	        // following elements don't exist until render is called
	        _userButton = this.$el.find('#user_button')
	        _userModal = this.$el.find('#user_modal');
	        _userEmail = this.$el.find('#user_email');
	        _userPassword = this.$el.find('#user_password');

			// bind user button pressed state to modal state
	        _userModal.bind('show', function() {
	        	_userButton.button('toggle');

	        	/* TODO: no idea why i need to wrap this in a timeout */
	        	setTimeout(function(){ _userEmail.focus(); }, 500);

	        }).bind('hide', function() {
	        	_userButton.button('toggle');
	        })
	    },

	    googleSignIn: function() {
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

		facebookSignIn: function() {
			// http://developers.facebook.com/docs/reference/dialogs/oauth/
		    var endpoint = 'http://www.facebook.com/dialog/oauth/';
			var params = {
				client_id: '576982815664713',
				redirect_uri: 'http://localhost:8000/oauth2callback',
				scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar',
				state: ''
			};
			window.location = endpoint + '?' + $.param(params);
		}

	});

	return AccountView;

});