define([
	'jquery',
	'underscore',
	'backbone',
	'models/user_model'
], function(
	jQuery,
	_,
	Backbone,
	UserModel
) {

	var UserCollection = Backbone.Collection.extend({
	
		model: UserModel,
		url: '/users',

		initialize: function() {
			this.fetch();
		}

	});

	// Notice we're instantiating here.
	return UserCollection;

});