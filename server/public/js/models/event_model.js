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

	var that,
		MODE_NONE = 0,
		MODE_EDIT = 1,
		MODE_VIEW = 2;

	var EventModel = Backbone.Model.extend({

		url: 'rest/event',

		defaults: {
			mode: MODE_NONE,
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

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			that = this;
			
			that.set('name', options.name || '');
			that.set('dayCode', options.dayCode || '');

		}

	});

	return EventModel;

});