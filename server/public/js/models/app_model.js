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
	'collections/friend_collection',

	'models/account_model',
	'models/calendar_model',
	'models/day_model',
	'models/event_model',
	'models/notification_model',
	'models/link_model',
	'models/basic_model',
	'models/thinking_model',
	'models/friend_model',

	'views/account_controls_view',
	'views/account_view',
	'views/calendar_view',
	'views/day_view',
	'views/event_view',
	'views/notification_view',
	'views/basic_view',
	'views/thinking_view'

], function(
	jQuery,
	_,
	Backbone,

	C,
	AppView,

	EventCollection,
	FriendCollection,

	AccountModel,
	CalendarModel,
	DayModel,
	EventModel,
	NotificationModel,
	LinkModel,
	BasicModel,
	ThinkingModel,
	FriendModel,

	AccountControlsView,
	AccountView,
	CalendarView,
	DayView,
	EventView,
	NotificationView,
	BasicView,
	ThinkingView

) {

	var that,
		_router,
		_appView,

		_eventCollection,
		_friendCollection,
		
		_accountModel,
		_calendarModel,
		_dayModel,
		_eventModel,
		_notificationModel,
		_basicModel,
		_thinkingModel,

		_accountControlsView,
		_accountView,
		_calendarView,
		_dayView,
		_eventView,
		_notificationView,
		_basicView,
		_thinkingView;

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
					// Built in init.
					break;
				case C.ActiveViews.Day:
					that.buildDayModel();
					break;
				case C.ActiveViews.Basic:
					_accountControlsView.hideUserModal();
					that.buildBasicModel();
					_basicView.render();
					break;
				case C.ActiveViews.Thinking:
					that.buildThinkingModel();
					_thinkingView.render();
					break;
			}
		},

		handleError: function(model, response) {
			var error = response;
log('handleError', response);
			if (error.status) {
				error = JSON.parse(error.responseText);
			}
			if (error && error.code) {
				// Error from C.Errors
				error = C.Errors[error.code];
			}

			that.showError(error);
		},

		showError: function(error) {
			that.showView(C.ActiveViews.Basic);
log(error);
			var errorMessage = '';
			if (error.message) {
				// Error from C.Errors
				errorMessage = error.message;
			} else if (typeof error == 'string') {
				// Simple string error.
				errorMessage = error;
			} else {
				// Some error object from any number of libraries.
				errorMessage = JSON.stringify(error);
			}
			_basicModel.set('header', 'Error');
			_basicModel.set('body', errorMessage);
			_router.navigate('error', { trigger: true });
		},

		// Only instantiate as needed.
		buildDayModel: function() {
log('buildDayModel', _eventCollection);
			if (!_dayModel) {
				_dayModel = new DayModel({ appModel: that, eventCollection: _eventCollection });
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

		buildThinkingModel: function() {
			if (!_thinkingModel) {
				_thinkingModel = new ThinkingModel({ appModel: that });
				that.set('thinkingModel', _thinkingModel);
				_thinkingView = new ThinkingView({ model: that.get('thinkingModel'), appModel: that, el: $('#blank_holder') });
			}
		},









		// FROM ROUTER ////////////////////////////////////////////////////////
		route: function(route) {
			var dest = route.dest;
			if (route.pullAccountFirst && !_accountModel.get('userId')) {
				that.showView(C.ActiveViews.Thinking);
				_accountModel.fetch({ 
					success: function() { 
log('Pulled account from server', _accountModel, route);
						_accountControlsView.render();

						_friendCollection.fetch({
							success: function() {
log('Pulled friends.', _friendCollection);
								dest();
							},
							error: that.handleError

						});

					},
					error: that.handleError
				});
			} else {
				dest();
			}
		},

		routeCatchall: function() {
			that.showView(C.ActiveViews.Calendar);
		},

		routeLogout: function() {
			that.logout();
		},

		routeAccount: function(action, linkId) {
			switch (action) {
				case C.Links.EmailConfirmation:
					var linkModel = new LinkModel({ appModel: that, linkId: linkId });
					that.showView(C.ActiveViews.Thinking);
					linkModel.fetch({
						success: function() {
							if (linkModel.get('type') == C.Links.EmailConfirmation) {
								_accountModel.fetch({
									success: function() {
										if (_accountModel.get('missingPassword')) {
											
											// Reflect that we logged user in.
											_accountControlsView.render();
											_accountModel.set('state', C.States.InitialPasswordSet);
											_accountControlsView.render();
											that.showView(C.ActiveViews.Account);
											setTimeout(function() {
												_accountView.$el.find('[data-focus=1]').focus();
											}, 500);

										} else {
											_accountModel.set('state', C.States.Saved);
											that.showView(C.ActiveViews.Account);
										}
									},
									error: that.handleError
								});
							}
						},
						error: that.handleError				
					});
					break;
				case C.Links.ResetPassword:
					var linkModel = new LinkModel({ appModel: that, linkId: linkId });
					that.showView(C.ActiveViews.Thinking);
					linkModel.fetch({
						success: function() {
							if (linkModel.get('type') == C.Links.ResetPassword) {
								_accountModel.fetch({
									success: function() {
										
										// Reflect that we logged user in.
										_accountControlsView.render();
										_accountModel.set('state', C.States.PasswordReset);
										_accountModel.set('pwResetToken', linkId);
										that.showView(C.ActiveViews.Account);
										setTimeout(function() {
											_accountView.$el.find('[data-focus=1]').focus();
										}, 500);
										
									},
									error: that.handleError
								});
							}
						},
						error: that.handleError				
					});
					break;
				case C.States.Created:
					_accountModel.fetch({
						success: function() {
							_accountModel.set('state', C.States.Created);
							_accountControlsView.hideUserModal();
							_accountControlsView.render();
							that.showView(C.ActiveViews.Account);
						},
						error: that.handleError
					});
					break;
				case C.States.Saved:
					_accountModel.set('state', C.States.Saved);
					that.showView(C.ActiveViews.Account);
					break;
				default:
					_accountModel.set('state', '');
					that.showView(C.ActiveViews.Account);
					break;
			}			
		},

		routeCalendar: function() {
			that.showView(C.ActiveViews.Calendar); 
		},

		routeDay: function(dayCode, eventId) {
			that.buildDayModel();
			
			_dayModel.set('dayCode', dayCode);

			if (eventId) {
				// Single Event.

				_eventCollection.fetchSingleEvent(eventId, function() {
					that.setSelectedEvent(eventId);
					that.showView(C.ActiveViews.Day);
				});

			} else {
				// Days Events.

				_eventCollection.fetchEventsForDay(dayCode, function() {
					that.showView(C.ActiveViews.Day);
				});

			}
		},

		routeOAuth: function(response) {
			_accountModel.oauth(response);
		},

		routeLink: function(linkId) {
			var linkModel = new LinkModel({ appModel: that, id: linkId });
			log('fetch link');
			linkModel.fetch({
				success: function() {
					switch (linkModel.get('type')) {
						default:
							alert('Done fetching link.  Build this out.');
							break;
					}
				},
				error: that.handleError
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
			that.setSelectedEvent(event.cid);
			return event.cid;
		},

		setSelectedEvent: function(eventId) {
			if (eventId) {
				var selectedEventModel = _eventCollection.get(eventId);
log('selectedEventModel', selectedEventModel);
				_eventView.setModel(selectedEventModel);
				_dayModel.set('selectedEventId', selectedEventModel.cid);
			} else {
				var blankEventModel = new EventModel({ appModel: that });
				_eventView.setModel(blankEventModel);
				_dayModel.set('selectedEventId', null);
			}
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
log('saveEvent');
			if (_accountModel.get('isFullUser')) {
				//var eventCid = _dayModel.get('selectedEventId');
				//var eventModel = _eventCollection.get(eventCid);
				var eventModel = _eventView.getModel();
log('eventModel', eventModel);
				eventModel.save([], {
					wait: true,
					success: function(model, response) {
log('event saved', model, response);
						var dayCode = eventModel.get('dayCode');
						var eventId = eventModel.get('eventId');
						var url = 'day/' + dayCode + '/event/' + eventId;
						_router.navigate(url, { trigger: true });
					},
					error: that.handleError
				});
			} else {
				_accountControlsView.showLoginForm();
			}
		},
		///////////////////////////////////////////////////////////////////////










		// FROM ACCOUNT CONTROLS VIEW /////////////////////////////////////////
		createAccount: function() {
			_accountModel.set('state', C.States.Create);
			_accountModel.save([], {
				wait: true,
				success: function(model, response) {
					_router.navigate('account/created', { trigger: true });
				},
				error: function(model, response) {
					if (response.responseText) {
						var error = JSON.parse(response.responseText);
						if (error.code == C.ErrorCodes.AccountEmailTaken) {
							_accountControlsView.handleError(error);
						} else {
							that.handleError(model, response);
						}
					}
				}
			});
		},

		login: function() {
log('AppMode.login');
			_accountModel.set('state', C.States.Login);
			_accountModel.save([], {
				wait: true,
				success: function(model, response) {
log('LOGIN SUCCESS');
log(model);
log(response);
log(_accountModel);
					_accountControlsView.hideUserModal();
					_accountControlsView.render();
				},
				// Example of how to do custom error handling.
				error: function(model, response) {
					if (response.responseText) {
						var error = JSON.parse(response.responseText);
						if (error.code == C.ErrorCodes.AccountLoginPassword || 
						error.code == C.ErrorCodes.AccountLoginPartialAccount ||
						error.code == C.ErrorCodes.AccountLoginEmail) {
							_accountControlsView.handleError(error);
						} else {
							that.handleError(model, response);
						}
					}
				}
			})
		},

		logout: function() {
			_accountModel.set('state', C.States.Logout);
			_accountModel.save([], {
				wait: true,
				success: function(model, response) {
					window.location = C.Domain; // Best way to guarantee all backbone state is wiped out.
				},
				error: that.handleError
			});
		},

		forgotPassword: function() {
			_accountModel.set('state', C.States.ForgotPassword);
			_accountModel.save([], {
				wait: true,
				success: function(model, response) {
					_accountControlsView.handleForgotPasswordSuccess();
				},
				error: function(model, response) {
					if (response.responseText) {
						var error = JSON.parse(response.responseText);
						if (error.code == C.ErrorCodes.AccountForgotNoAccount) {
							_accountControlsView.handleError(error);
						} else {
							that.handleError(model, response);
						}
					}
				}
			});
		},
		///////////////////////////////////////////////////////////////////////









		// FROM ACCOUNT VIEW //////////////////////////////////////////////////
		changePassword: function() {
			_accountModel.save([], {
				wait: true,
				success: function() {
					_router.navigate('account/saved', { trigger: true });
				},
				error: that.handleError
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

		///////////////////////////////////////////////////////////////////////

		initialize: function(options) {
log('appModel.initialize');
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			that = this;

			options = options || {};
			_router = options.router;

			_eventCollection = new EventCollection();
			that.set('eventCollection', _eventCollection);

			_friendCollection = new FriendCollection();
			that.set('friendCollection', _friendCollection);	
	
			_accountModel = new AccountModel({ appModel: that  });
			_calendarModel = new CalendarModel({ appModel: that });
			
			that.set('accountModel', _accountModel);
			that.set('calendarModel', _calendarModel);
			
			_accountControlsView = new AccountControlsView({ model: that.get('accountModel'), appModel: that, el: $('#account_controls_view_holder') });
			_calendarView = new CalendarView({ model: that.get('calendarModel'), appModel: that, el: $('#calendar_view_holder') });
			_appView = new AppView({ model: that, el: $('body') });

			//_accountModel.set('state', C.States.InitialPasswordSet);
			//that.showView(C.ActiveViews.Account);			
		},

	});

	return AppModel;

});