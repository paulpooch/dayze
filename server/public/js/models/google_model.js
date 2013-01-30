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
			isConnected: false,
			hasPermissions: false,
			id: null,
			accessToken: null,
		},

		initialize: function(attrs, options) {
			that = this;
			_.bindAll(that);
			_appModel = options.appModel;
			_accountModel = options.accountModel;
		},

		fetchToken: function(callback) {
			var endpoint = 'https://accounts.google.com/o/oauth2/auth';
			var params = {
				client_id: '495360231026.apps.googleusercontent.com',
				response_type: 'token',
				redirect_uri: 'http://localhost:8000/oauth',
				scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar',
				state: callback
			};
			window.location = endpoint + '?' + $.param(params);
		},

		fetchedToken: function(response) {
			var callback = response.state;
			that.set('accessToken', response.access_token);
			that[callback](true);
		},

		login: function(isValidated) {
			if (that.get('accessToken') != null) {
				that.set('isLoggedIn', true);
				_appModel.googleLogin();
			} else {
				that.fetchToken('login');
			}
		},

		create: function() {
			that.set('isLoggedIn', true);
			_accountModel.set('unconfirmedEmail', response.email);
			_accountModel.save();
		},

		fetchProfile: function(callback) {
			$.ajax({
				url:  'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + that.get('accessToken'),
				success: function(response) {
log(response);
					that.set('isConnected', true);
					that.set('id', response.id);
					_appModel.set('displayName', response.name);
					_appModel.set('email', response.email);
					_appModel.set('loginEmail', response.email);
					if (callback) { 
						callback();
					}
				},
				statusCode: {
					401: function() { 
log('invalid oauth token!');
					}
				}
			});
		},

		fetchCalendars: function() {
				$.ajax({
					url:  'https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token=' + response.access_token,
					success: function(data) {
log(data);
					}
				});
		},

		logout: function() {
			that.set('isLoggedIn', false);
			that.set('accessToken', null);
		}

	});

	return GoogleModel;

});