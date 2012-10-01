///////////////////////////////////////////////////////////////////////////////
// DAY VIEW
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',

	'text!templates/day_template.html',
], function(
	jQuery,
	_,
	Backbone,

	DayTemplate
) {

	var _app;

	var DayView = Backbone.View.extend({

		template: _.template(DayTemplate),

		defaults: {},

		render: function() {
			console.log('render day');
			this.$el.html(this.template(this.model.toJSON()));
		},

		update: function() {
			console.log('day view update');
			console.log('update day view');
			var dayCode = this.model.get('dayCode');
			console.log('dayCode is ', dayCode);
			this.render();
		},

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);

			var options = options || {};
			_app = options.app;
			
			this.model.on('change:dayCode', this.update);
		},

		events: function() {
		}


	});

	return DayView;

});