///////////////////////////////////////////////////////////////////////////////
// CALENDAR MODEL
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone'
], function(
	jQuery,
	_,
	Backbone
) {

	var that,
		_app,
		_appModel,
		_eventCollection;

	var CalendarModel = Backbone.Model.extend({

		defaults: {
			monthNames: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
			monthCode: '',
			isActiveView: false
		},

		// EVENTS /////////////////////////////////////////////////////////////
		onMonthCodeChange: function() {
			_appModel.pullEventsForMonth(that.get('monthCode'));	
		},

		onEventCollectionChange: function() {
			
		},
		///////////////////////////////////////////////////////////////////////

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			
			// VARS
			that = this;
			_app = options.app;
			_appModel = options.appModel;
			_eventCollection = _appModel.get('eventCollection');

			// BINDINGS
			that.bind('change:monthCode', that.onMonthCodeChange);
			_eventCollection.bind('change', that.onEventCollectionChange);
		}

	});

	return CalendarModel;

});