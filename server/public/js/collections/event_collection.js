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
		url: '/event',

		getEventsWithDayCode: function(dayCode) {
			return _eventsByDay[dayCode] || [];
		},

		onAdd: function(event) {
			var dayCode = event.get('dayCode');
			console.log(event);
			var existingEvents = _eventsByDay[dayCode] || [];
			console.log('existing events =', existingEvents);
			existingEvents.push(event);
			console.log('existingEvents = ', existingEvents);
			_eventsByDay[dayCode] = existingEvents;
			console.log('onAdd, dayCode = ', dayCode);
		},

		initialize: function() {

			_eventsByDay = {};

			this.on('add', this.onAdd);
		}

	});

	// Notice we're instantiating here.
	return EventCollection;

});