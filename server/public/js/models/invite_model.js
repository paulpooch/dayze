///////////////////////////////////////////////////////////////////////////////
// INVITE MODEL
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

	var InviteModel = Backbone.Model.extend({

		urlRoot: '/rest/invite',
		idAttribute: 'inviteId',

		defaults: {
			inviteId: null,
			userId: null, 
			eventId: null,
			responded: null, // Did user respond?  0 or 1
			response: null, // 0-100 (%)
			emailed: null, // Was user already emailed invite?  0 or 1 - prevents spam.
			friendModel: null
		},

		validate: function(attrs) {

		},

		toJSON: function() {
			return {
				inviteId: that.get('inviteId'),
				userId: that.get('userId'),
				eventId: that.get('eventId'),
				responded: that.get('responded'),
				response: that.get('response'),
				emailed: that.get('emailed'),
				friendModel: that.get('friendModel'),
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

	return InviteModel;

});