///////////////////////////////////////////////////////////////////////////////
// ACCOUNT MODEL
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

	var FriendModel = Backbone.Model.extend({

		urlRoot: '/rest/friend',
		idAttribute: 'friendId',

		defaults: {
			userId: null,
			friendId: null,
			eventsTogether: 0,
			appModel: null
		},

		validate: function(attrs) {

		},

		toJSON: function() {
			return {
				userId: that.get('userId'),
				friendId: that.get('friendId'),
				eventsTogether: that.get('eventsTogether')
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

	return FriendModel;

});