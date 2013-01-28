///////////////////////////////////////////////////////////////////////////////
// INVITE MODEL
///////////////////////////////////////////////////////////////////////////////
define([
	'underscore',
	'backbone',

	'c',
	'models/user_model'
], function(
	_,
	Backbone,

	C,
	UserModel
) {

	var that;

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
			userModel: new UserModel()
		},

		toJSON: function() {
			return {
				inviteId: that.get('inviteId'),
				userId: that.get('userId'),
				eventId: that.get('eventId'),
				responded: that.get('responded'),
				response: that.get('response'),
				emailed: that.get('emailed'),
				userModel: that.get('userModel').toJSON()
			};
		},

		// EVENTS /////////////////////////////////////////////////////////////
		
		///////////////////////////////////////////////////////////////////////

		initialize: function(attrs) {
			that = this;

			if (attrs && attrs.userModel && !(attrs.userModel instanceof UserModel)) { // Is it a json object instead of a real model?
				var userModel = new UserModel(attrs.userModel);
				that.set('userModel', userModel);
			}

			// EVENTS
		}

	});

	return InviteModel;

});