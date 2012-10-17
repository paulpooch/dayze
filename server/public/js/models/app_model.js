///////////////////////////////////////////////////////////////////////////////
// APP MODEL
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',

	'views/app_view',

	'collections/event_collection',

	'models/account_model',
	'models/calendar_model',
	'models/day_model',
	'models/event_model',

	'views/account_view',
	'views/calendar_view',
	'views/day_view',
	'views/event_view'
], function(
	jQuery,
	_,
	Backbone,

	AppView,

	EventCollection,

	AccountModel,
	CalendarModel,
	DayModel,
	EventModel,

	AccountView,
	CalendarView,
	DayView,
	EventView
) {

	var that,
		_app,
		_appView,

		_eventCollection,
		
		_accountModel,
		_calendarModel,
		_dayModel,
		_eventModel,

		_accountView,
		_calendarView,
		_dayView,
		_eventView;

	var AppModel = Backbone.Model.extend({

		// Try to put every value in here so stuff is more obvious.
		defaults: {
			dayModalVisible: false,
			accountCollection: null,
			eventCollection: null,
			accountModel: null,
			calendarModel: null,
			dayModel: null,
			eventModel: null
		},

		renderEventView: function(dayViewEl) {
			var eventViewEl = dayViewEl.find('#event_view_holder');
			_eventView.setElAndRender(eventViewEl);
		},

		renderCalendarView: function() {
			_calendarView.render();
		},

		addEvent: function(eventName, eventDayCode) {
			// Begin here creating event model.
			var event = new EventModel({ app: _app, appModel: that, name: eventName, dayCode: eventDayCode });
			_eventCollection.add(event);
			return event.cid;
		},

		setSelectedEvent: function(cid) {
			var selectedEventModel = _eventCollection.getByCid(cid);
			_eventView.setModel(selectedEventModel);
		},

		displayDay: function(dayCode) {
			var events = _eventCollection.get(dayCode);
			
			_dayModel.set('events', events);
			_dayModel.set('dayCode', dayCode);
			that.set('dayModalVisible', true);
		},

		saveEvent: function() {
			var eventCid = _dayModel.get('selectedEventId');
			var eventModel = _eventCollection.getByCid(eventCid);
			console.log('saving', eventModel);
			
			eventModel.save({ name: 'someName'}, {
				wait: true,
				success: function(model, response) {
					console.log(1);
				},
				error: function(model, error) {
					console.log(0);
				}
			});

		},

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			that = this;

			options = options || {};
			_app = options.app;

			_eventCollection = new EventCollection();
			that.set('eventCollection', _eventCollection);
	
			_accountModel = new AccountModel();
			_calendarModel = new CalendarModel({ app: options.app, appModel: that });
			_dayModel = new DayModel({ app: options.app, appModel: that });
			_eventModel = new EventModel({ app: options.app, appModel: that });
			
			that.set('accountModel', _accountModel);
			that.set('calendarModel', _calendarModel);
			that.set('dayModel', _dayModel);
			that.set('eventModel', _eventModel);

			_accountView = new AccountView({ model: that.get('accountModel'), appModel: that, el: $('#account_view_holder') });
			_calendarView = new CalendarView({ model: that.get('calendarModel'), appModel: that, el: $('#calendar_view_holder') });
			_eventView = new EventView({ model: that.get('eventModel'), appModel: that, el: $('#event_view_holder') });
			_dayView = new DayView({ model: that.get('dayModel'), appModel: that, el: $('#day_view_holder') });
			_appView = new AppView({ model: that, el: $('body') });
			
			// Don't hammer dynamo please.
			_accountModel.fetch();

		}

	});

	return AppModel;

});