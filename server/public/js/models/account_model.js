define([
	'underscore',
	'backbone'
], function(
	_,
	Backbone
) {

	var AccountModel = Backbone.Model.extend({

		defaults: {
			displayName: 'Anonymous'
		},

		initialize: function(user) {
			this.set({ displayName: (user && user.displayName) || this.get('displayName') }); 
		}

	});

	return AccountModel;

});