///////////////////////////////////////////////////////////////////////////////
// APP MODEL
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',

	'c',
	'views/app_view',

	'collections/event_collection',

	'models/account_model',
	'models/calendar_model',
	'models/day_model',
	'models/event_model',

	'views/account_view',
	'views/calendar_view',
	'views/day_view',
	'views/event_view',
	'views/create_account_view'
], function(
	jQuery,
	_,
	Backbone,

	C,
	AppView,

	EventCollection,

	AccountModel,
	CalendarModel,
	DayModel,
	EventModel,

	AccountView,
	CalendarView,
	DayView,
	EventView,
	CreateAccountView
) {

	var that,
		_router,
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
			// Turns off initial model fetches so you can do UI development without crushing server.
			SUPPRESS_SERVER_CALLS: true,

			WEEK_SCROLL_BUFFER: 50,
			PAST_WEEKS_TO_SHOW: 20,
			
			activeView: '',
			accountCollection: null,
			eventCollection: null,
			accountModel: null,
			calendarModel: null,
			dayModel: null,
			eventModel: null
		},

		// MODEL EVENTS ///////////////////////////////////////////////////////

		///////////////////////////////////////////////////////////////////////

		routeCreateAccount: function() {
			var createAccountView = new CreateAccountView({ model: that.get('accountModel'), appModel: that, el: $('#page_holder') });
			that.set('activeView', C.ActiveViews.CreateAccount); 
		},

		routeCalendar: function() {
			that.set('activeView', C.ActiveViews.Calendar); 
		},

		// When a day is clicked in calendar.
		displayDayView: function(dayCode) {
			var events = _eventCollection.get(dayCode);
			
			_dayModel.set('events', events);
			_dayModel.set('dayCode', dayCode);

			// Trigger modal in app_view.
			that.set('activeView', C.ActiveViews.Day); 
		},

		oauth2Callback: function(response) {
			_accountView.oauth2Callback(response);
		},

		renderEventView: function(dayViewEl) {
			var eventViewEl = dayViewEl.find('#event_view_holder');
			_eventView.setElAndRender(eventViewEl);
		},

		// Called by AppView during initialization.
		renderCalendarView: function() {
			_calendarView.render();
		},

		addEvent: function(eventName, eventDayCode) {
			// Begin here creating event model.
			var event = new EventModel({ app: this, appModel: that, name: eventName, dayCode: eventDayCode });
			_eventCollection.add(event);
			return event.cid;
		},

		setSelectedEvent: function(cid) {
			var selectedEventModel = _eventCollection.getByCid(cid);
			_eventView.setModel(selectedEventModel);
		},

		saveEvent: function() {
			var eventCid = _dayModel.get('selectedEventId');
			var eventModel = _eventCollection.getByCid(eventCid);
			
			eventModel.save({}, {
				wait: true,
				success: function(model, response) {

				},
				error: function(model, error) {

				}
			});

		},

		// TODO: This should be intelligent.
		// Not repull a million times.
		pullEventsForMonth: function(monthCode) {
			if (!that.get('SUPPRESS_SERVER_CALLS')) {
				_eventCollection.fetch({ data: $.param({ monthCode: monthCode }) });
			}
		},

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			that = this;

			options = options || {};
			_router = options.app;

			_eventCollection = new EventCollection();
			that.set('eventCollection', _eventCollection);
	
			_accountModel = new AccountModel({ appModel: that  });
			_calendarModel = new CalendarModel({ appModel: that });
			_dayModel = new DayModel({ appModel: that });
			_eventModel = new EventModel({ appModel: that });
			
			that.set('accountModel', _accountModel);
			that.set('calendarModel', _calendarModel);
			that.set('dayModel', _dayModel);
			that.set('eventModel', _eventModel);

			_accountView = new AccountView({ model: that.get('accountModel'), appModel: that, el: $('#account_view_holder') });
			_calendarView = new CalendarView({ model: that.get('calendarModel'), appModel: that, el: $('#calendar_view_holder') });
			_eventView = new EventView({ model: that.get('eventModel'), appModel: that, el: $('#event_view_holder') });
			_dayView = new DayView({ model: that.get('dayModel'), appModel: that, el: $('#page_holder') });
			_appView = new AppView({ model: that, el: $('body') });
			
			if (!that.get('SUPPRESS_SERVER_CALLS')) {
				_accountModel.fetch();
			}

			that.set('activeView', C.ActiveViews.Calendar)

		}

	});

	return AppModel;

});