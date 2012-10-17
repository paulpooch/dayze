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
			'click .event_listing button': 'onEventClick',
			'keydown #addEventText': 'onAddEventTextKeydown',
			'click #saveButton': 'onSaveButtonClick'
		},

		onAddEventButtonClick: function() {
			var eventText = that.$el.find('#addEventText').val();
			var dayCode = that.model.get('dayCode');
			var eventCid = _appModel.addEvent(eventText, dayCode);

			// Trigger onEventClick.
			that.$el.find('button[data-id=' + eventCid + ']').click();
		},

		onEventClick: function(e) {
			var id = $(e.target).data('id');
			_appModel.setSelectedEvent(id);
			that.model.set('selectedEventId', id);
		},

		onAddEventTextKeydown: function(e) {
			// Make sure 'enter' does what we expect.
			var code = e.which;
			if (code == 13) {
				e.preventDefault();
				that.onAddEventButtonClick();
				return false;
			}
		},

		onSaveButtonClick: function() {
			_appModel.saveEvent();
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

		onSelectedEventIdChange: function() {
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
			that.model.on('change:selectedEventId', that.onSelectedEventIdChange);

			that.update();
		}

	});

	return DayView;

});