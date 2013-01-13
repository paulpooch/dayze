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
			that.$el.html(that.template(that.model.toJSON()));
			_appModel.renderEventView(this.$el);
			_$eventAddForm = that.$el.find('#event_add_form');
			_eventAddForm = new SmartForm(that.model, _$eventAddForm, that.onAddEventButtonClick);
			that.$el.css({ height: ($(window).height() - C.RESERVED_VERTICAL_SPACE) + 'px' });
		},

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
			'change input': 'syncForm',
			'change textarea': 'syncForm',
			'click .event_listing a': 'onEventClick',
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
		},

		onEventClick: function(e) {
			var id = $(e.target).data('id');
			_appModel.setSelectedEvent(id);
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
			that.model.bind('change:selectedEventId', that.render);
			_appModel.bind('change:activeView', that.onActiveViewChange);

			// When user selects a different day.
			//that.model.bind('change:dayCode', that.render);
			// When user clicks an event.
			// When user adds an event.
			//that.model.bind('change:todaysEvents', that.render);

			

			that.render();
		}

	});

	return DayView;

});