///////////////////////////////////////////////////////////////////////////////
// DAY VIEW
///////////////////////////////////////////////////////////////////////////////
define(['jquery', 'underscore', 'backbone'], function(jQuery, _, Backbone) {

	var _app;

	var DayView = Backbone.View.extend({

		defaults: function() {
			return { };
		},

		initialize: function(options) {
			var options = options || {};
			_app = options.app;
			_.bindAll(this); // binds all event callbacks to 'this'
		},

		events: function() {
		},

		render: function() {
		},

	});

	return DayView;

});