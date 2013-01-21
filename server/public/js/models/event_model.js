///////////////////////////////////////////////////////////////////////////////
// EVENT MODEL
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone'
], function(
	jQuery,
	_,
	Backbone
) {

	var that;

	var EventModel = Backbone.Model.extend({

		urlRoot: '/rest/event',
		idAttribute: 'eventId',

		defaults: {
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

		addToInvited: function(invitee) {
log('addToInvited', invitee);
			var invited = that.get('invited');
			if (invited.hasOwnProperty(invitee)) {
				alert(invitee + ' is already invited.');
			} else {

				if (typeof invitee == 'string') { // email
					// Filter this somehow
					// Hotfield?
					
				} else { // friend model

				}

				invited[invitee] = 1;
			}
			that.set('invited', invited);
			that.trigger('change:invited');
log(invited);
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