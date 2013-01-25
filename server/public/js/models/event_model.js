///////////////////////////////////////////////////////////////////////////////
// EVENT MODEL
///////////////////////////////////////////////////////////////////////////////
define([
	'underscore',
	'backbone',
	'c',
	'collections/invite_collection',
	'models/invite_model'
], function(
	_,
	Backbone,
	C,
	InviteCollection,
	InviteModel
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
			inviteCollection: null,
			userId: null
		},

		validate: function() {
			// Only return errors.
			var errors = [];

			if (errors.length) return errors;
		},

		// Without this, somehow .save() fails.
		// Related to underscore's clone method I think.
		// Line 235 of backbone.js
		toJSON: function() {
			return {
				eventId: that.get('eventId'),
				name: that.get('name'),
				dayCode: that.get('dayCode'),
				description: that.get('description'),
				location: that.get('location'),
				beginTime: that.get('beginTime'),
				endTime: that.get('endTime'),
				invited: that.get('invited'),
				inviteCollection: that.get('inviteCollection').toJSON(),
				userId: that.get('userId'),
			};
		},

		parse: function(json) {
log('EventModel.parse', json);
			if (json.inviteCollection) {
				var inviteModels = [];
				_.each(json.inviteCollection, function(val, key) {
					var inviteModel = new InviteModel(val);
log('inviteModel', inviteModel);
					inviteModels.push(inviteModel);
				});
				var inviteCollection = that.get('inviteCollection');
				inviteCollection.update(inviteModels);
				that.set('inviteCollection', inviteCollection);
				delete json.inviteCollection;
			}
			return json;
		},

		// TODO:
		// If email, go to server and see if there's a corresponding account.
		addToInvited: function(invitee) {
			var invited = that.get('invited');
			if (typeof invitee == 'string') { // email
				if (invited.hasOwnProperty(invitee)) {
					alert(invitee + ' is already invited.');
				} else {
					invited[invitee] = C.EmailInvitee;
				} 
			} else { // friend model
				var friendId = invitee.get('friendId');
				if (invited.hasOwnProperty(friendId)) {
					alert(friendId + ' is already invited.');
				} else {
					invited[friendId] = invitee;
				}
			}
			that.set('invited', invited);
			that.trigger('change:invited');
log(invited);
		},

		removeFromInvited: function(invitee) {
			var invited = that.get('invited');
			delete invited[invitee];
			that.set('invited', invited);
			that.trigger('change:invited');
		},

		// EVENTS /////////////////////////////////////////////////////////////

		///////////////////////////////////////////////////////////////////////

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			that = this;

			that.set('inviteCollection', new InviteCollection());

		}

	});

	return EventModel;

});