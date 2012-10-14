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

		defaults: {
			displayName: 'Anonymous'
		},

		initialize: function(user) {
			_.bindAll(this);
			that = this;

			this.set({ displayName: (user && user.displayName) || this.get('displayName') });
		}

	});

	return AccountModel;

});