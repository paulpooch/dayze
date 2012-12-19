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

	var states = {
		'created': {
			message: 'Account was created successfully.<br/>Please check your email and click the confirmation link to finish registration.'
		},
		'initialPwSet': {
			message: 'Thanks for confirming your email.<br/>You can set a password now if you want.'
		},
		'saved': {
			message: 'Your account has been updated.'
		}

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
			errors: null,
			state: null,
			password: null,
			missingPassword: null,
			loginEmail: null,
			loginPassword: null,
			loginRemember: false
		},

		validate: function(attrs) {
			if (attrs.errors) {
				_appModel.showError(attrs.errors);
				return attrs.errors;
			}
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
				loginRemember: that.get('loginRemember')
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