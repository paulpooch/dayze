///////////////////////////////////////////////////////////////////////////////
// CALENDAR MODEL
///////////////////////////////////////////////////////////////////////////////
define(['jquery', 'underscore', 'backbone'], function(jQuery, _, Backbone) {

	var CalendarModel = Backbone.Model.extend({

		defaults: {
			monthNames: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]
		},

		initialize: function() {

		},

	});

	return CalendarModel;

});