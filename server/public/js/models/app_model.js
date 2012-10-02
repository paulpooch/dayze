///////////////////////////////////////////////////////////////////////////////
// APP MODEL
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',

	'collections/event_collection',

	'models/account_model',
	'models/calendar_model',
	'models/day_model',
], function(
	jQuery,
	_,
	Backbone,

	EventCollection,

	AccountModel,
	CalendarModel,
	DayModel
) {

	var _app,
		_eventCollection,
		_accountModel,
		_calendarModel,
		_dayModel;

	var AppModel = Backbone.Model.extend({

		// Try to put every value in here so stuff is more obvious.
		defaults: {
			dayModalVisible: false,
			accountModel: null,
			calendarModel: null,
			dayModel: null
		},
		       
	    initialize: function(options) {
	    	var options = options || {};
	    	_app = options.app;

	    	_eventCollection = new EventCollection();

	    	_accountModel = new AccountModel();
			_calendarModel = new CalendarModel({ app: options.app, appModel: this });
			_dayModel = new DayModel({ app: options.app, appModel: this });
	    	
	    	this.set('accountModel', _accountModel);
	    	this.set('calendarModel', _calendarModel);
	    	this.set('dayModel', _dayModel);

	    	_accountModel.fetch();
	    },

	    addEvent: function(eventName) {

	    	// Begin here creating event model.
	    	var event = new EventModel({ app: options, appModel: this });


	    },

	    displayDay: function(dayCode) {
	    	console.log('AppModel.displayDay');
	    	console.log(dayCode);
	    	var events = _eventCollection.get(dayCode);
	    	// do something with events

	    	_dayModel.set('events', events);
	    	_dayModel.set('dayCode', dayCode);
	    	this.set('dayModalVisible', true);
	    }

	   
	});

	return AppModel;

});