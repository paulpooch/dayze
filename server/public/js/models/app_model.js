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

	var _eventCollection,
		_accountModel,
		_calendarModel,
		_dayModel;

	var AppModel = Backbone.Model.extend({
		       
	    initialize: function(options) {
	    	var options = options || {};
	    
	    	_eventCollection = new EventCollection();

	    	_accountModel = new AccountModel();
			_calendarModel = new CalendarModel({ app: options.app, appModel: this });
			_dayModel = new DayModel();
	    	
	    	this.set('accountModel', _accountModel);
	    	this.set('calendarModel', _calendarModel);
	    	this.set('dayModel', _dayModel);

	    	_accountModel.fetch();
	    },

	    displayDay: function(dayCode) {
	    	console.log('AppModel.displayDay');
	    	console.log(dayCode);
	    	var events = _eventCollection.get(dayCode);
	    	// do something with events

	    	_dayModel.set('events', events);
	    	_dayModel.set('dayCode', dayCode);

	    	// This probably shouldn't be here...
	    	// Move to AppView
	    	$('#myModal').modal('show');

	    }

	   
	});

	return AppModel;

});