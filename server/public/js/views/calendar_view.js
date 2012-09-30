///////////////////////////////////////////////////////////////////////////////
// CALENDAR VIEW
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',

	'text!templates/week_template.html'
], function(
	jQuery,
	_,
	Backbone,

	WeekTemplate
) {

	var _app,
		_calendarModel,
		
		_heightOfOneWeek,
		_prevY,
		_weekElements,
		_template,

		_$window,
		_$calendar,
		_$monthName;
	

	var CalendarView = Backbone.View.extend({

		defaults: function() {
			return { };
		},

		initialize: function(options) {
			console.log('calendar view init');
			var options = options || {};
			_app = options.app;
			_calendarModel = options.model;

			_.bindAll(this); // binds all event callbacks to 'this'

			//this.model.bind('change', render);
			_$window = $(window);
			_$calendar = this.$el.find('#calendar');
			_$monthName = $('#month_name');
			_prevY = _$window.scrollTop();
			_weekElements = [];

			// can't be registered within View.events
			_$window.scroll(this.onScroll);
		},

		events: {
			'click .day': 'onDayClick'
		},

		render: function() {
			var initialWeekCount = 30;
			var weekDate = new Date();
			var day = weekDate.getDay();
			var diff = weekDate.getDate() - day;
			weekDate.setDate(diff);

			this.renderWeek(weekDate);
			for (var i = 0; i < initialWeekCount; i++) {
			    weekDate.setDate(weekDate.getDate() + 7);
			    this.renderWeek(weekDate);
			}

			var firstVisibleWeek = _weekElements[0].timestamp;
			var currentMonth = this.model.get('monthNames')[firstVisibleWeek.getMonth()];
			_$monthName.text(currentMonth);
		},

		onScroll: function() {
			var scrollTop = _$window.scrollTop();
			if (!_heightOfOneWeek) {
				_heightOfOneWeek = _$calendar.find('.day_wrap:eq(0)').height();
				console.log(_heightOfOneWeek);
			}
			if (Math.abs(scrollTop - _prevY) > _heightOfOneWeek / 2) {
				var hiddenWeekCount = Math.ceil(scrollTop / _heightOfOneWeek);
				var firstVisibleWeek = _weekElements[hiddenWeekCount].timestamp;
				var currentMonth = this.model.get('monthNames')[firstVisibleWeek.getMonth()];
				_prevY = _$window.scrollTop();
				_$monthName.text(currentMonth);
				console.log('update ' + currentMonth);
			}
		},

		onDayClick: function() {
			_calendarModel.onDayClick();
		},

		renderWeek: function(weekDate) {
			if (!_template) {
				//_template = _.template($("#template_week").html());
				_template = _.template(WeekTemplate);
			}
			var weekDateCopy = new Date(weekDate);
	        var days = {};
	        days['d0'] = weekDateCopy.getDate();
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d1'] = weekDateCopy.getDate();
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d2'] = weekDateCopy.getDate();
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d3'] = weekDateCopy.getDate();
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d4'] = weekDateCopy.getDate();
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d5'] = weekDateCopy.getDate();
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d6'] = weekDateCopy.getDate();
	        var el = _template(days);
	        _weekElements.push({
	        	htmlEl: el,
	        	timestamp: new Date(weekDate)
	        });
	       _$calendar.append(el);
		}

	});

	return CalendarView;

});