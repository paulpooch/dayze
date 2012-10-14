///////////////////////////////////////////////////////////////////////////////
// APP MODEL
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',

	'collections/account_collection',
	'collections/event_collection',

	'models/account_model',
	'models/calendar_model',
	'models/day_model',
	'models/event_model'

], function(
	jQuery,
	_,
	Backbone,

	AccountCollection,
	EventCollection,

	AccountModel,
	CalendarModel,
	DayModel,
	EventModel

) {

	var that,
		_app,
		_mediator,
		_eventCollection,
		_accountModel,
		_calendarModel,
		_dayModel;

	var AppModel = Backbone.Model.extend({
		// ATTRIBUTES:
		// dayModalVisible
		// eventCollection
		// accountModel
		// calendarModel
		// dayModel
		// eventModel

		// Try to put every value in here so stuff is more obvious.
		defaults: {
			dayModalVisible: false,
			eventCollection: null,
			accountModel: null,
			calendarModel: null,
			dayModel: null,
			eventModel: null
		},

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			that = this;

			options = options || {};
			_app = options.app;
			_mediator = options.mediator;

			_eventCollection = new EventCollection();
			this.set('eventCollection', _eventCollection);
	
			_accountModel = new AccountModel();
			_calendarModel = new CalendarModel({ app: options.app, appModel: this });
			_dayModel = new DayModel({ app: options.app, appModel: this });
			_eventModel = new EventModel({ app: options.app, appModel: this });
			
			this.set('accountModel', _accountModel);
			this.set('calendarModel', _calendarModel);
			this.set('dayModel', _dayModel);
			this.set('eventModel', _eventModel);

			_accountModel.fetch();
		},

		addEvent: function(eventName, eventDayCode) {
			// Begin here creating event model.
			var event = new EventModel({ app: _app, appModel: this, name: eventName, dayCode: eventDayCode });
			_eventCollection.add(event);
		},

		setSelectedEvent: function(cid) {
			var selectedEvent = _eventCollection.getByCid(cid);
			// BEGIN HERE
			// should event view sit inside day view?
			// We have to do EventView.setModel(selectedEvent)
			//	or something similar
			_mediator.setSelectedEvent(selectedEvent);
			// Let's use a mediator for cross component communication.

		},

		displayDay: function(dayCode) {
			var events = _eventCollection.get(dayCode);
			
			_dayModel.set('events', events);
			_dayModel.set('dayCode', dayCode);
			this.set('dayModalVisible', true);
		}

	});

	return AppModel;

});