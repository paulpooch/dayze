///////////////////////////////////////////////////////////////////////////////
// FACEBOOK MODEL - SUBMODEL OF ACCOUNT MODEL
///////////////////////////////////////////////////////////////////////////////
define([
	'underscore',
	'backbone',

	'c'
], function(
	_,
	Backbone,

	C
) {

	var that;

	var FacebookModel = Backbone.Model.extend({

		defaults: {
			accountModel: null,
			isLoggedIn: false,
			accessToken: '',
			userId: '',
			isReady: false
		},

		initialize: function(options) {
			that = this;
			_.bindAll(that);

			window.fbAsyncInit = function() {
				// init the FB JS SDK
				FB.init({
					appId      : '576982815664713', // App ID from the App Dashboard
					channelUrl : C.Domain + '/channel.html', // Channel File for x-domain communication
					status     : true, // check the login status upon init?
					cookie     : true, // set sessions cookies to allow your server to access the session?
					xfbml      : true  // parse XFBML tags on this page?
				});

				that.set('isReady', true);
				that.checkLoginStatus();
			};
		
			// asynchronously load facebook api
			(function(d, debug) {
			var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
			if ( d.getElementById(id) ) { return; }
			js = d.createElement('script'); js.id = id; js.async = true;
			js.src = "//connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
			ref.parentNode.insertBefore(js, ref);
			} (document, /*debug*/ false) );

		},

		checkLoginStatus: function() {
			FB.getLoginStatus(function(response) {
				if (response.status === 'connected') {
					// the user is logged in and has authenticated your
					// app, and response.authResponse supplies
					// the user's ID, a valid access token, a signed
					// request, and the time the access token 
					// and signed request each expire
					that.set('userId', response.authResponse.userID);
					that.set('accessToken', response.authResponse.accessToken);
					that.set('isLoggedIn', true);

				} else if (response.status === 'not_authorized') {
					// the user is logged in to Facebook, 
					// but has not authenticated your app
					that.set('isLoggedIn', false);

				} else {
					// the user isn't logged in to Facebook.
					that.set('isLoggedIn', false);
				}
			});
		},

		login: function() {
			if (!that.get('isReady')) return;
			FB.login(function(response) {
				if (response.authResponse) {
					that.set('isLoggedIn', true);
					that.set('accessToken', response.authResponse.accessToken);
					that.fetchEvents();
				} else {
					that.set('isLoggedIn', false);
				}
			});
		},

		logout: function() {
			FB.logout(function(response) {
				that.set('isLoggedIn', false);
				that.set('accessToken', null);
			});
		},

		fetchEvents: function() {
			$.ajax({
				url: 'https://graph.facebook.com/me/events?access_token=' + that.get('accessToken'),
				success: function(data) {
log(data);
				}
			});
		}

	});

	return FacebookModel;

});