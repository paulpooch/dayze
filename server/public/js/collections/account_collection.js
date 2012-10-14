define([
	'jquery',
	'underscore',
	'backbone',
	'models/account_model'
], function(
	jQuery,
	_,
	Backbone,
	AccountModel
) {

	var AccountCollection = Backbone.Collection.extend({
	
		model: AccountModel,
		url: '/account',

		initialize: function() {
		//	this.fetch();
		}

	});

	// Notice we're instantiating here.
	return AccountCollection;

});