///////////////////////////////////////////////////////////////////////////////
// CALENDAR MODEL
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',

	'c'
], function(
	jQuery,
	_,
	Backbone,

	C
) {

	var that,
		_appModel,
		_eventCollection;

	var CalendarModel = Backbone.Model.extend({

		defaults: {
			monthNames: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
			monthCode: ''
		},

		// EVENTS /////////////////////////////////////////////////////////////
		onMonthCodeChange: function() {
			var delay = null;
			return function() {
				if (delay) {
					clearTimeout(delay);
				}
				delay = setTimeout(function() {
					_appModel.pullEventsForMonth(that.get('monthCode'));
					delay = null;
				}, C.PULL_EVENTS_FOR_MONTH_DELAY);
			};			
		}(),

		onEventCollectionChange: function() {
			
		},
		///////////////////////////////////////////////////////////////////////

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			
			// VARS
			that = this;
			_appModel = options.appModel;
			_eventCollection = _appModel.get('eventCollection');

			// BINDINGS
			that.bind('change:monthCode', that.onMonthCodeChange);
			_eventCollection.bind('change', that.onEventCollectionChange);
		}

	});

	return CalendarModel;

});