///////////////////////////////////////////////////////////////////////////////
// ACCOUNT MODEL
///////////////////////////////////////////////////////////////////////////////
define([
	'underscore',
	'backbone',

	'models/google_model',
	'models/facebook_model',
	'c'
], function(
	_,
	Backbone,

	GoogleModel,
	FacebookModel,
	C
) {

	var that,
		_appModel,
		_googleModel,
		_facebookModel;

	var states = {};
	states[C.States.Created] = {
		message: 'Account was created successfully.<br/>Please check your email and click the confirmation link to finish registration.'
	};
	states[C.States.InitialPasswordSet] = {
		message: 'Thanks for confirming your email.<br/>You can set a password now if you want.'
	};
	states[C.States.Saved] = {
		message: 'Your account has been updated.'
	};

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
			unconfirmedEmail: null,
			email: null,
			message: '',
			state: null,
			password: null,
			missingPassword: null,
			loginEmail: null,
			loginPassword: null,
			loginRemember: false,
			forgotEmail: null
		},

		validate: function(attrs) {

		},

		toJSON: function() {
			return {
				userId: that.get('userId'),
				displayName: that.get('displayName'),
				isFullUser: that.get('isFullUser'),
				unconfirmedEmail: that.get('unconfirmedEmail'),
				googleToken: _googleModel.get('accessToken'),
				facebookToken: _facebookModel.get('accessToken'),
				email: that.get('email'),
				message: that.get('message'),
				state: that.get('state'),
				isLoggedIn: that.get('isLoggedIn'),
				password: that.get('password'),
				missingPassword: that.get('missingPassword'),
				loginEmail: that.get('loginEmail'),
				loginPassword: that.get('loginPassword'),
				loginRemember: that.get('loginRemember'),
				forgotEmail: that.get('forgotEmail')
			};
		},

		oauth: function(response) {
			that.get('googleModel').oauth(response);
		},

		// EVENTS /////////////////////////////////////////////////////////////
		onStateChange: function() {
			var state = that.get('state');
			var stateInfo = states[state];
			if (stateInfo && stateInfo.message) {
				that.set('message', stateInfo.message);
			}
		},
		///////////////////////////////////////////////////////////////////////

		initialize: function(options) {
			that = this;
			_.bindAll(that);

			_appModel = options.appModel;
			_googleModel = new GoogleModel({ accountModel: that });
			_facebookModel = new FacebookModel({ accountModel: that });

			that.set('googleModel', _googleModel);
			that.set('facebookModel', _facebookModel);

			// EVENTS
			that.bind('change:state', that.onStateChange);

		}

	});

	return AccountModel;

});