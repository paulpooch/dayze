///////////////////////////////////////////////////////////////////////////////
// GOOGLE MODEL - SUBMODEL OF ACCOUNT MODEL
///////////////////////////////////////////////////////////////////////////////
define([
	'underscore',
	'backbone'
], function(
	_,
	Backbone
) {

	var that,
		_accountModel;

	var GoogleModel = Backbone.Model.extend({

		defaults: {
			accountModel: null,
			isLoggedIn: false,
			accessToken: '',
			userId: ''
		},

		initialize: function(options) {
			that = this;
			_.bindAll(that);
			_accountModel = that.get('accountModel');
			that.checkLoginStatus();
		},

		checkLoginStatus: function() {
			
		},

		login: function() {
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

		oauth: function(response) {
			$.ajax({
				url:  'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + response.access_token,
				success: function(data) {
					console.log(data);
					_accountModel.set('displayName', data.name);
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


		logout: function() {
				that.set('isLoggedIn', false);
				that.set('accessToken', null);
		}

	});

	return GoogleModel;

});