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
			createAccountEmail: ''
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
			_.bindAll(this);
			that = this;
			this.set({ displayName: (user && user.displayName) || this.get('displayName') });
		}

	});

	return AccountModel;

});