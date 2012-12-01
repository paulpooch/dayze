///////////////////////////////////////////////////////////////////////////////
// ACCOUNT MODEL
///////////////////////////////////////////////////////////////////////////////
define([
	'underscore',
	'backbone',

	'models/google_model',
	'models/facebook_model'
], function(
	_,
	Backbone,

	GoogleModel,
	FacebookModel
) {

	var that;

	var AccountModel = Backbone.Model.extend({

		url: '/rest/account',

		defaults: {
			appModel: null,
			googleModel: null,
			facebookModel: null, 
			isLoggedIn: false,
			displayName: 'Anonymous',
			isFullUser: false,
			createAccountEmail: ''
		},

		toJSON: function() {
			return {
				displayName: that.get('displayName'),
				isFullUser: that.get('isFullUser'),
				createAccountEmail: that.get('createAccountEmail')
			};
		},

		oauth: function(response) {
			that.get('googleModel').oauth(response);
		},

		// EVENTS /////////////////////////////////////////////////////////////

		///////////////////////////////////////////////////////////////////////

		initialize: function(user) {
			that = this;
			_.bindAll(that);
			that.set('googleModel', new GoogleModel({ accountModel: that }));
			that.set('facebookModel', new FacebookModel({ accountModel: that }));
			that.set({ displayName: (user && user.displayName) || that.get('displayName') });
		}

	});

	return AccountModel;

});