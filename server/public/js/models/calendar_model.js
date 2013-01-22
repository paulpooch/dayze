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
				if (_appModel.get('activeView') == C.ActiveViews.Calendar) {

					if (delay) {
						clearTimeout(delay);
					}
					delay = setTimeout(function() {
						// Let's not do this while we develop.
						// This may belong somewhere else.
						// Should be a binding.
						_eventCollection.fetchEventsForMonth(that.get('monthCode'), function() {
							// Anything to do in callback?
							// Somehow do?
							//_calendarView.onMonthLoaded(monthCode);
						});
						delay = null;
					}, C.PULL_EVENTS_FOR_MONTH_DELAY);

				}
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