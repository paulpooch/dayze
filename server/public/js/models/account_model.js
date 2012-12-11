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
		_appModel,
		_googleModel,
		_facebookModel;

	var AccountModel = Backbone.Model.extend({

		urlRoot: '/rest/account',
		idAttribute: 'userId',

		defaults: {
			userId: null,
			appModel: null,
			googleModel: null,
			facebookModel: null, 
			isLoggedIn: false,
			displayName: 'Anonymous',
			isFullUser: false,
			createAccountEmail: '',
			email: '',
			message: '',
			isBeingCreated: false,
			errors: null
		},

		validate: function(attrs) {
			if (attrs.errors) {
log('AccountModel validate failed', attrs.errors);
				_appModel.showError(attrs.errors);
				return attrs.errors;
			}
		},

		toJSON: function() {
			return {
				userId: that.get('userId'),
				displayName: that.get('displayName'),
				isFullUser: that.get('isFullUser'),
				createAccountEmail: that.get('createAccountEmail'),
				googleToken: _googleModel.get('accessToken'),
				facebookToken: _facebookModel.get('accessToken'),
				email: that.get('email'),
				message: that.get('message'),
				isBeingCreated: that.get('isBeingCreated')
			};
		},

		oauth: function(response) {
			that.get('googleModel').oauth(response);
		},

		// EVENTS /////////////////////////////////////////////////////////////

		///////////////////////////////////////////////////////////////////////

		initialize: function(options) {
			that = this;
			_.bindAll(that);

			_appModel = options.appModel;
			_googleModel = new GoogleModel({ accountModel: that });
			_facebookModel = new FacebookModel({ accountModel: that });

			that.set('googleModel', _googleModel);
			that.set('facebookModel', _facebookModel);

			//that.set({ displayName: (user && user.displayName) || that.get('displayName') });
		}

	});

	return AccountModel;

});