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

	var that,
		_googleModel,
		_facebookModel;

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
				createAccountEmail: that.get('createAccountEmail'),
				googleToken: _googleModel.get('accessToken'),
				facebookToken: _facebookModel.get('accessToken')
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

			_googleModel = new GoogleModel({ accountModel: that });
			_facebookModel = new FacebookModel({ accountModel: that });

			that.set('googleModel', _googleModel);
			that.set('facebookModel', _facebookModel);

			that.set({ displayName: (user && user.displayName) || that.get('displayName') });
		}

	});

	return AccountModel;

});