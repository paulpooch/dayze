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

	var that,
		_appModel;

	var DayView = Backbone.View.extend({

		template: _.template(DayTemplate),

		render: function() {
			//console.log('render day');
			//console.log(that.model.toJSON());
			this.$el.html(that.template(that.model.toJSON()));
			_appModel.renderEventView(this.$el);
		},

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
			'click #addEventButton': 'onAddEventButtonClick',
			'click .event_listing button': 'onEventClick'
		},

		onAddEventButtonClick: function() {
			var eventText = that.$el.find('#addEventText').val();
			var dayCode = that.model.get('dayCode');
			//console.log(dayCode);
			_appModel.addEvent(eventText, dayCode);
		},

		onEventClick: function(e) {
			var id = $(e.target).data('id');
			_appModel.setSelectedEvent(id);

			//that.model.setSelectedEvent(id);
			//var eventText = that.$el.find('#addEventText').val();
			//var dayCode = that.model.get('dayCode');
			//console.log(dayCode);
			//_appModel.addEvent(eventText, dayCode);
		},
		///////////////////////////////////////////////////////////////////////

		// MODEL EVENTS ///////////////////////////////////////////////////////
		update: function() {
			var dayCode = that.model.get('dayCode');
			that.render();
		},

		onTodaysEventsChange: function() {
			that.update();
		},
		// END MODEL EVENTS ///////////////////////////////////////////////////

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			
			// VARS
			that = this;
			_appModel = options.appModel;
			
			// BINDINGS
			that.model.on('change:dayCode', that.update);
			that.model.on('change:todaysEvents', that.onTodaysEventsChange);

			that.update();
		}

	});

	return DayView;

});