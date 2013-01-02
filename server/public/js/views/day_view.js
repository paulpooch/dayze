///////////////////////////////////////////////////////////////////////////////
// DAY VIEW
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',

	'c',
	'text!templates/day_template.html',
	'smart_form'
], function(
	jQuery,
	_,
	Backbone,

	C,
	DayTemplate,
	SmartForm
) {

	var that,
		_appModel,
		_$eventAddForm,
		_eventAddForm;

	var DayView = Backbone.View.extend({

		template: _.template(DayTemplate),

		render: function() {
			this.$el.html(that.template(that.model.toJSON()));
			_appModel.renderEventView(this.$el);
			_$eventAddForm = that.$el.find('#event_add_form');
			_eventAddForm = new SmartForm(that.model, _$eventAddForm, that.onAddEventButtonClick);
		},

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
			'change input': 'syncForm',
			'change textarea': 'syncForm',
			'click .event_listing button': 'onEventClick',
			'keydown #addEventText': 'onAddEventTextKeydown',
			'keydown #addEventText': 'syncForm',
		},

		syncForm: function(e) {
			var target = $(e.currentTarget);
      		var data = {};
      		data[target.attr('id')] = target.val();
      		that.model.set(data);
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

		onActiveViewChange: function() {
			if (_appModel.get('activeView') == C.ActiveViews.Day) {
				_$headerEls.show();
				_$headerEls.find('#day_display_date').text(that.model.get('displayDate'));
			} else {
				_$headerEls.hide();
			}
		},
		// END MODEL EVENTS ///////////////////////////////////////////////////

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			that = this;

			// VARS
			_appModel = options.appModel;
			_$headerEls = $('.day_view_header');
			
			// BINDINGS
			that.model.on('change:dayCode', that.update);
			that.model.on('change:todaysEvents', that.onTodaysEventsChange);
			that.model.on('change:selectedEventId', that.onSelectedEventIdChange);
			_appModel.on('change:activeView', that.onActiveViewChange);

			//that.update();
		}

	});

	return DayView;

});