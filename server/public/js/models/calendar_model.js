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

	var _app,
		_appModel;

	var CalendarModel = Backbone.Model.extend({

		defaults: {
			monthNames: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]
		},

		initialize: function(options) {
			_app = options.app;
			_appModel = options.appModel;
		},

		onDayClick: function(dayCode) {
			console.log('CalendarModel.onDayClick');
			_appModel.displayDay(dayCode);
		}

	});

	return CalendarModel;

});