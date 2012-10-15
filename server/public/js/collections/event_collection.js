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
		url: 'rest/event',

		getEventsWithDayCode: function(dayCode) {
			return _eventsByDay[dayCode] || [];
		},

		onAdd: function(event) {
			var dayCode = event.get('dayCode');
			var existingEvents = _eventsByDay[dayCode] || [];
			existingEvents.push(event);
			_eventsByDay[dayCode] = existingEvents;
		},

		initialize: function() {
			_eventsByDay = {};
			this.on('add', this.onAdd);
		}

	});

	return EventCollection;

});