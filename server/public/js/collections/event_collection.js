define([
	'jquery',
	'underscore',
	'backbone',

	'models/event_model'
], function(
	jQuery,
	_,
	Backbone,
	
	EventModel
) {

	var that,
		_app,
		_appModel,
		_eventsByDay;

	var EventCollection = Backbone.Collection.extend({
	
		model: EventModel,
		url: '/rest/event',

		getEventsWithDayCode: function(dayCode) {
			return _eventsByDay[dayCode] || [];
		},

		// EVENTS /////////////////////////////////////////////////////////////
		onAdd: function(event) {
			var dayCode = event.get('dayCode');
			var existingEvents = _eventsByDay[dayCode] || [];
			existingEvents.push(event);
			_eventsByDay[dayCode] = existingEvents;
		},

		onChange: function() {

		},

		onReset: function() {

		},

		initialize: function() {
			_.bindAll(this);
			that = this;

			// BINDINGS
			_eventsByDay = {};
			that.on('add', that.onAdd);
			that.on('change', that.onChange);
			that.on('reset', that.onReset);
		}

	});

	return EventCollection;

});