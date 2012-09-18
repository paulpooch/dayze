define(['jquery', 'underscore', 'backbone'], function(jQuery, _, Backbone) {

    var GoogleOAuth = Backbone.Model.extend({

    	defaults: function() {
    		return {
		    	oAuthUrl:	'https://accounts.google.com/o/oauth2/auth?',
	        	validUrl:   'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=',
	        	scope: 		'https://www.googleapis.com/auth/userinfo.profile',
	        	clientId: 	'433322211111.apps.googleusercontent.com',
	        	redirect: 	'http://localhost:8888/MAMP/html5/oauth/',
	        	type: 		'token',
	        	url: 		OAUTHURL + 'scope=' + SCOPE + '&client_id=' + CLIENTID + '&redirect_uri=' + REDIRECT + '&response_type=' + TYPE
        	};
    	},

    	initialize: function() {
    		/* TODO: http://www.gethugames.in/blog/2012/04/authentication-and-authorization-for-google-apis-in-javascript-popup-window-tutorial.html */
    	}

    });

    return GoogleOAuth;

});