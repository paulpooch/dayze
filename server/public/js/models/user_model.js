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

	var that,
		_appModel;

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

		// EVENTS /////////////////////////////////////////////////////////////
		
		///////////////////////////////////////////////////////////////////////

		initialize: function(options) {
			that = this;
			_.bindAll(that);

			_appModel = options.appModel;
		
			// EVENTS
		}

	});

	return UserModel;

});