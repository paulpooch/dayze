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
		},

		validateToken: function(options) {
			console.log(options)
			$.ajax({
				url:  'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + options.accessToken,
				success: function(response) {
					console.log(response);
					if (response.error === undefined) {
						// valid oauth token, proceed

						switch(options.action) {

							case 'sign_in':

							break;

							case 'connect':

							break;

							case 'register':
								that.set('isLoggedIn', true);
								that.set('accessToken', response.access_token);
								_accountModel.set('createAccountEmail', response.email);
								_accountModel.save();
							break;

						}

					} else {
						// invalid oauth token
						that.set('isLoggedIn', false);
						that.set('accessToken', '');
					}				
				}
			});
		},

		connect: function(action) {
			// https://developers.google.com/accounts/docs/OAuth2Login
			var endpoint = 'https://accounts.google.com/o/oauth2/auth';
			var params = {
				client_id: '495360231026.apps.googleusercontent.com',
				response_type: 'token',
				redirect_uri: 'http://localhost:8000/oauth',
				scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar',
				state: action
			};
			window.location = endpoint + '?' + $.param(params);
		},

		oauth: function(response) {
			$.ajax({
				url:  'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + response.access_token,
				success: function(data) {
					that.validateToken({ accessToken: response.access_token, data: data, action: response.action, callback: fetchCalendars});
				},
				statusCode: {
					401: function() { console.log('invalid oauth token!') }
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