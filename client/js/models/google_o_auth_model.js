define(['jquery', 'underscore', 'backbone'], function(jQuery, _, Backbone) {

    var GoogleOAuthModel = Backbone.Model.extend({

    	defaults: function() {
    		return {
		    	oAuthUrl:	'https://accounts.google.com/o/oauth2/auth?',
	        	validUrl:   'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=',
	        	scope: 		'https://www.googleapis.com/auth/userinfo.profile',
	        	clientId: 	'433322211111.apps.googleusercontent.com',
	        	redirect: 	'http://localhost:8888/MAMP/html5/oauth/',
	        	type: 		'token',
	        	url: 		this.oAuthUrl + 'scope=' + this.scope + '&client_id=' + this.clientId + '&redirect_uri=' + this.redirect + '&response_type=' + this.type;
        	};
    	},

    	initialize: function() {
    		/* TODO: http://www.gethugames.in/blog/2012/04/authentication-and-authorization-for-google-apis-in-javascript-popup-window-tutorial.html
https://developers.google.com/accounts/docs/OAuth2Login
https://developers.google.com/accounts/docs/OAuth2
            */
    	},

        registerListeners: function() {

        }

    });

    return GoogleOAuthModel;

});