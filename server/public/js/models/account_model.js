///////////////////////////////////////////////////////////////////////////////
// ACCOUNT MODEL
///////////////////////////////////////////////////////////////////////////////
define([
	'underscore',
	'backbone'
], function(
	_,
	Backbone
) {

	var that;

	var AccountModel = Backbone.Model.extend({

		url: '/rest/account',

		defaults: {
			displayName: 'Anonymous',
			isFullUser: false,
			createAccountEmail: '',
			googleToken: '',
			facebookToken: ''
		},

		toJSON: function() {
			return {
				displayName: that.get('displayName'),
				isFullUser: that.get('isFullUser'),
				createAccountEmail: that.get('createAccountEmail')
			};
		},

		// EVENTS /////////////////////////////////////////////////////////////

		///////////////////////////////////////////////////////////////////////

		initialize: function(user) {
			that = this;
			_.bindAll(that);
			that.set({ displayName: (user && user.displayName) || that.get('displayName') });
		}

	});

	return AccountModel;

});