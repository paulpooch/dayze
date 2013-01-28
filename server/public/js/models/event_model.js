///////////////////////////////////////////////////////////////////////////////
// EVENT MODEL
///////////////////////////////////////////////////////////////////////////////
define([
	'underscore',
	'backbone',
	'c',
	'collections/invite_collection',
	'models/invite_model',
	'models/user_model'
], function(
	_,
	Backbone,
	C,
	InviteCollection,
	InviteModel,
	UserModel
) {

	var that;

	var EventModel = Backbone.Model.extend({

		urlRoot: '/rest/event',
		idAttribute: 'eventId',

		defaults: {
			eventId: null,
			name: null,
			dayCode: null,
			description: null,
			location: null,
			beginTime: null,
			endTime: null,
			invited: {},
			inviteCollection: new InviteCollection(),
			userId: null
		},

		toJSON: function() {
			return {
				eventId: that.get('eventId'),
				name: that.get('name'),
				dayCode: that.get('dayCode'),
				description: that.get('description'),
				location: that.get('location'),
				beginTime: that.get('beginTime'),
				endTime: that.get('endTime'),
				inviteCollection: that.get('inviteCollection').toJSON(),
				userId: that.get('userId'),
			};
		},

		parse: function(json) {
			if (json.inviteCollection) {
				var inviteModels = [];
				_.each(json.inviteCollection, function(val, key) {
					var inviteModel = new InviteModel(val);
					inviteModels.push(inviteModel);
				});
				var inviteCollection = that.get('inviteCollection');
				inviteCollection.update(inviteModels);
				that.set('inviteCollection', inviteCollection);
				that.trigger('change:inviteCollection');
				delete json.inviteCollection;
			}
			return json;
		},

		// TODO:
		// If email, go to server and see if there's a corresponding account.
		addToInvited: function(invitee) {

			var inviteCollection = that.get('inviteCollection');
			if (typeof invitee == 'string') { // email not friendModel 

				// TODO: check pre-existing
				var inviteModel = new InviteModel();
				var userModel = inviteModel.get('userModel');
				userModel.set('email', invitee);
				inviteModel.set('userModel', userModel);
				inviteCollection.add(inviteModel);
				
			}
			that.set('inviteCollection', inviteCollection);
			that.trigger('change:inviteCollection');

			// var invited = that.get('invited');
			// if (typeof invitee == 'string') { // email
			// 	if (invited.hasOwnProperty(invitee)) {
			// 		alert(invitee + ' is already invited.');
			// 	} else {
			// 		invited[invitee] = C.EmailInvitee;
			// 	} 
			// } else { // friend model
			// 	var friendId = invitee.get('friendId');
			// 	if (invited.hasOwnProperty(friendId)) {
			// 		alert(friendId + ' is already invited.');
			// 	} else {
			// 		invited[friendId] = invitee;
			// 	}
			// }
			// that.set('invited', invited);
			//that.trigger('change:invited');
		},

		removeFromInvited: function(invitee) {
			// var invited = that.get('invited');
			// delete invited[invitee];
			// that.set('invited', invited);
			// that.trigger('change:invited');
		},

		// EVENTS /////////////////////////////////////////////////////////////

		///////////////////////////////////////////////////////////////////////

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			that = this;

		}

	});

	return EventModel;

});