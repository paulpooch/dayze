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

		defaults: {
			name: 'the name',
			dayCode: ''
		},

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			that = this;
			
			this.set('name', options.name || '');
			this.set('dayCode', options.dayCode || '');

		}

	});

	return EventModel;

});