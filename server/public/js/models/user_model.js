///////////////////////////////////////////////////////////////////////////////
// USER MODEL
///////////////////////////////////////////////////////////////////////////////
define([
	'underscore',
	'backbone',

	'c'
], function(
	_,
	Backbone,

	C
) {

	var that;

	// For use inside InviteModel.
	// Otherwise use Account or Friend.
	var UserModel = Backbone.Model.extend({

		idAttribute: 'userId',

		defaults: {
			userId: null,
			email: null,
			displayName: null
		},
		
		validate: function(attrs) {

		},

		toJSON: function() {
			return {
				userId: that.get('userId'),
				email: that.get('email'),
				displayName: that.get('displayName')
			};
		},

		initialize: function(attrs, options) {
			that = this;
		}

	});

	return UserModel;

});