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
		_app,
		_appModel;

	var DayView = Backbone.View.extend({

		template: _.template(DayTemplate),

		render: function() {
			//console.log('render day');
			console.log(that.model.toJSON());
			this.$el.html(that.template(that.model.toJSON()));
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
			console.log(id);

			that.model.setSelectedEvent(id);
			//var eventText = that.$el.find('#addEventText').val();
			//var dayCode = that.model.get('dayCode');
			//console.log(dayCode);
			//_appModel.addEvent(eventText, dayCode);
		},
		// END VIEW EVENTS ////////////////////////////////////////////////////

		// MODEL EVENTS ///////////////////////////////////////////////////////
		update: function() {
			//console.log('day view update');
			//console.log('update day view');
			var dayCode = that.model.get('dayCode');
			//console.log('dayCode is ', dayCode);
			//console.log('calEvents are ', this.model.get('calEvents'));
			//console.log('json', this.model.toJSON());
			that.render();
		},

		onCalEventsChange: function() {
			console.log('onCalEventsChange');
			that.update();
		},
		// END MODEL EVENTS ///////////////////////////////////////////////////

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			
			// VARS
			that = this;
			_app = options.app;
			_appModel = options.appModel;
			
			// BINDINGS
			that.model.on('change:dayCode', that.update);
			that.model.on('change:calEvents', that.onCalEventsChange);

			that.update();
		}

	});

	return DayView;

});