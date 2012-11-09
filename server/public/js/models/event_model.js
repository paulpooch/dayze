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

		url: '/rest/event',

		defaults: {
			name: 'No Events',
			dayCode: '',
			description: '',
			location: '',
			beginTime: '',
			endTime: ''
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
			
			that.set('name', options.name || '');
			that.set('dayCode', options.dayCode || '');
			

			// BINDINGS
			that.bind('change', that.onChange);			
		}

	});

	return EventModel;

});