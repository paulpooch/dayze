///////////////////////////////////////////////////////////////////////////////
// EVENT MODEL
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
			invited: {}
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
				eventId: this.get('eventId'),
				name: this.get('name'),
				dayCode: this.get('dayCode'),
				description: this.get('description'),
				location: this.get('location'),
				beginTime: this.get('beginTime'),
				endTime: this.get('endTime'),
				invited: this.get('invited')
			};
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
				
		}

	});

	return EventModel;

});