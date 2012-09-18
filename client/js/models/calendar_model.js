define(['jquery', 'underscore', 'backbone'], function(jQuery, _, Backbone) {

	var _getMonthNames = function(calendar) {
		return calendar.get('monthNames');
	};

	var CalendarModel = Backbone.Model.extend({

		defaults: function() {
			return {
				monthNames: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]
			};
		},

		initialize: function() {

		},

		getMonthNames: _getMonthNames

	});

	return CalendarModel;

});