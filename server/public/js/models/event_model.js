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
			endTime: null
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
				endTime: this.get('endTime')
			};
		},
		
		// EVENTS /////////////////////////////////////////////////////////////
		onChange: function() {
			
		},

		///////////////////////////////////////////////////////////////////////

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			that = this;
			//that.set('name', options.name || null);
			//that.set('dayCode', options.dayCode || null);
			
			// BINDINGS
			that.bind('change', that.onChange);			
		}

	});

	return EventModel;

});