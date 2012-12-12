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
	'models/notification_model',
	'models/link_model',
	'models/basic_model',
	
	'views/account_controls_view',
	'views/account_view',
	'views/calendar_view',
	'views/day_view',
	'views/event_view',
	'views/notification_view',
	'views/basic_view'

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
	NotificationModel,
	LinkModel,
	BasicModel,

	AccountControlsView,
	AccountView,
	CalendarView,
	DayView,
	EventView,
	NotificationView,
	BasicView

) {

	var that,
		_router,
		_appView,

		_eventCollection,
		
		_accountModel,
		_calendarModel,
		_dayModel,
		_eventModel,
		_notificationModel,
		_basicModel,

		_accountControlsView,
		_accountView,
		_calendarView,
		_dayView,
		_eventView,
		_notificationView,
		_basicView;

	var AppModel = Backbone.Model.extend({

		// Try to put every value in here so stuff is more obvious.
		defaults: {
			// Turns off initial model fetches so you can do UI development without crushing server.
			SUPPRESS_SERVER_CALLS: C.SUPPRESS_SERVER_CALLS,

			WEEK_SCROLL_BUFFER: C.WEEK_SCROLL_BUFFER,
			PAST_WEEKS_TO_SHOW: C.PAST_WEEKS_TO_SHOW,
			
			activeView: '',
			accountCollection: null,
			eventCollection: null,
			accountModel: null,
			calendarModel: null,
			dayModel: null,
			eventModel: null,
			notificationModel: null
		},

		// MODEL EVENTS ///////////////////////////////////////////////////////

		///////////////////////////////////////////////////////////////////////

		showView: function(view) {
			// Will trigger header change in views.
			that.set('activeView', view);
			switch (view) {
				case C.ActiveViews.Account:
					that.buildAccountView();
					_accountView.render();
					break;
				case C.ActiveViews.Calendar:
					break;
				case C.ActiveViews.Day:
					break;
				case C.ActiveViews.Basic:
					break;
			}
		},

		// Only instantiate as needed.
		buildDayModel: function() {
			if (!_dayModel) {
				_dayModel = new DayModel({ appModel: that });
				that.set('dayModel', _dayModel);
				_dayView = new DayView({ model: that.get('dayModel'), appModel: that, el: $('#page_holder') });
			}
		},

		buildEventModel: function() {
			if (!_eventModel) {
				_eventModel = new EventModel({ appModel: that });
				that.set('eventModel', _eventModel);
				_eventView = new EventView({ model: that.get('eventModel'), appModel: that, el: $('#event_view_holder') });
			}	
		},

		buildNotificationModel: function() {
			if (!_notificationModel) {
				_notificationModel = new NotificationModel({ appModel: that });
				that.set('notificationModel', _notificationModel);
				_notificationView = new NotificationView({ model: that.get('notificationModel'), appModel: that, el: $('#account_view_holder') });
			}
		},

		buildBasicModel: function() {
			if (!_basicModel) {
				_basicModel = new BasicModel({ appModel: that });
				that.set('basicModel', _basicModel);
				_basicView = new BasicView({ model: that.get('basicModel'), appModel: that, el: $('#page_holder') });
			}
		},

		buildAccountView: function() {
			if (!_accountView) {
				_accountView = new AccountView({ model: that.get('accountModel'), appModel: that, el: $('#page_holder') });			
			}
		},

		showError: function(error) {
			that.buildBasicModel();
			_basicModel.set('error', error);
			_router.navigate('error', { trigger: true });
		},








		// FROM ROUTER ////////////////////////////////////////////////////////
		routeAccount: function(action, linkId) {
			switch (action) {
				case 'confirm_email':
					var linkModel = new LinkModel({ appModel: that, linkId: linkId });
					// Some kind of loading view instead?
					that.showView(C.ActiveViews.Account);

					linkModel.fetch({
						success: function() {
							if (linkModel.get('type') == 'email_confirmation') {
								_accountModel.fetch({
									success: function() {
										_accountModel.set('message', C.Strings.EmailConfirmed);
										_accountControlsView.render();
										that.showView(C.ActiveViews.Account);
									}
								});
							}
						}				
					});
					break;
				case 'created':
					_accountModel.fetch({
						success: function() {
							_accountModel.set('message', C.Strings.AccountCreated);
							_accountControlsView.hideUserModal();
							_accountControlsView.render();
							that.showView(C.ActiveViews.Account);
						}
					});
					break;
			}			
		},

		routeCalendar: function() {
			that.showView(C.ActiveViews.Calendar); 
		},

		routeDay: function(dayCode) {
			var events = _eventCollection.get(dayCode);
			
			that.buildDayModel();
			_dayModel.set('events', events);
			_dayModel.set('dayCode', dayCode);

			// Trigger modal in app_view.
			that.showView(C.ActiveViews.Day);
		},

		routeOAuth: function(response) {
			_accountModel.oauth(response);
		},

		routeLink: function(linkId) {
			var linkModel = new LinkModel({ appModel: that, id: linkId });
			linkModel.fetch({
				success: function() {
					switch (linkModel.get('type')) {
						default:
							alert('Done fetching link.  Build this out.');
							break;
					}
				}				
			});
		},

		routeError: function() {
			that.showView(C.ActiveViews.Basic);
		},
		///////////////////////////////////////////////////////////////////////





		









		// FROM DAY VIEW //////////////////////////////////////////////////////
		renderEventView: function(dayViewEl) {
			that.buildEventModel();
			var eventViewEl = dayViewEl.find('#event_view_holder');
			_eventView.setElAndRender(eventViewEl);
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
		///////////////////////////////////////////////////////////////////////










		// FROM CALENDAR VIEW /////////////////////////////////////////////////
		// When a day is clicked in calendar.
		navigateToDay: function(dayCode) {
			_router.navigate('day/' + dayCode, { trigger: true });
		},
		///////////////////////////////////////////////////////////////////////










		// FROM EVENT VIEW ////////////////////////////////////////////////////
		saveEvent: function() {
			if (_accountModel.get('isFullUser')) {
				var eventCid = that.getDayModel().get('selectedEventId');
				var eventModel = _eventCollection.getByCid(eventCid);
				eventModel.save({}, {
					wait: true,
					success: function(model, response) {
log('event saved', model, response);
					},
					error: function(model, error) {

					}
				});
			} else {
				_accountView.$el.find('#event_login_modal').modal('show');
			}
		},
		///////////////////////////////////////////////////////////////////////










		// FROM ACCOUNT VIEW //////////////////////////////////////////////////
		createAccount: function() {
			_accountModel.set('isBeingCreated', true);
			_accountModel.save({}, {
				wait: true,
				success: function() {
					_accountModel.set('isBeingCreated', false);
					_router.navigate('account/created', { trigger: true });
				},
				error: function(){
				}
			});
		},
		///////////////////////////////////////////////////////////////////////










		// FROM APP VIEW //////////////////////////////////////////////////////
		// Called by AppView during initialization.
		renderCalendarView: function() {
			_calendarView.render();
		},
		///////////////////////////////////////////////////////////////////////










		// FROM CALENDAR MODEL ////////////////////////////////////////////////
		// TODO: This should be intelligent.
		// Not repull a million times.
		pullEventsForMonth: function(monthCode) {
			if (!that.get('SUPPRESS_SERVER_CALLS')) {
				_eventCollection.fetch({ 
					data: $.param({ monthCode: monthCode }), 
					success: function() {
						_calendarView.onMonthLoaded(monthCode);
					}
				});
			}
		},
		///////////////////////////////////////////////////////////////////////

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			that = this;

			options = options || {};
			_router = options.router;

			_eventCollection = new EventCollection();
			that.set('eventCollection', _eventCollection);
	
			_accountModel = new AccountModel({ appModel: that  });
			_calendarModel = new CalendarModel({ appModel: that });
			
			that.set('accountModel', _accountModel);
			that.set('calendarModel', _calendarModel);
			
			_accountControlsView = new AccountControlsView({ model: that.get('accountModel'), appModel: that, el: $('#account_controls_view_holder') });
			_calendarView = new CalendarView({ model: that.get('calendarModel'), appModel: that, el: $('#calendar_view_holder') });
			_appView = new AppView({ model: that, el: $('body') });

			that.showView(C.ActiveViews.Calendar);

			// IF NO ACCOUNT...
			if (!_accountModel.get('userId')) {
				if (!that.get('SUPPRESS_SERVER_CALLS')) {
					_accountModel.fetch({ 
						success: function() { 
	log('Pulled account from server', _accountModel); 
						}
					});
				}
			}
			
		},

	});

	return AppModel;

});