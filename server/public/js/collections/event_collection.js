///////////////////////////////////////////////////////////////////////////////
// EVENT COLLECTION
///////////////////////////////////////////////////////////////////////////////
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
		_eventsByDay,
		_eventsByMonth;

	var EventCollection = Backbone.Collection.extend({
	
		model: EventModel,
		url: '/rest/event',

		getEventsWithDayCode: function(dayCode) {
			return _eventsByDay[dayCode] || [];
		},

		// Gets details.
		fetchSingleEvent: function(eventId, callback) {
			var eventModel = this.get(eventId);
			if (!eventModel) {
				eventModel = new EventModel({ eventId: eventId }, {});
			}
			eventModel.fetch({
				success: function() {
					that.add(eventModel);
					callback(eventModel);
				},
				error: that.handleError
			});
		},

		fetchEventsForDay: function(dayCode, callback) {
			that.fetch({ 
				data: $.param({ dayCode: dayCode }), 
				success: function() {
					callback();
				},
				error: that.handleError
			});
		},

		// TODO: This should be intelligent.
		// Not repull a million times.
		fetchEventsForMonth: function(monthCode, callback) {
			/*
			TURNED OFF FOR NOW TO SAVE $$
			
			that.fetch({ 
				data: $.param({ monthCode: monthCode }), 
				success: function() {
					callback();
				},
				error: that.handleError
			});
			*/
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

			_eventsByDay = {};
			_eventsByMonth = {};

			// BINDINGS
			that.on('add', that.onAdd);
			that.on('change', that.onChange);
			that.on('reset', that.onReset);
		}

	});

	return EventCollection;

});