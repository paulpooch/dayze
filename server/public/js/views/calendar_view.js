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

	var _heightOfOneWeek,
		_prevY,
		_weekElements,
		_template,

		_$window,
		_$calendar,
		_$monthName;
	

	var CalendarView = Backbone.View.extend({

		render: function() {
			var initialWeekCount = 30;
			var weekDate = new Date();
			var day = weekDate.getDay();
			var diff = weekDate.getDate() - day;
			weekDate.setDate(diff);
			weekDate = new Date(weekDate.getFullYear(), weekDate.getMonth(), weekDate.getDate(), 0, 0, 0, 0);
			//weekDate.setHours(0);
			//weekDate.setMinutes(0);
			//weekDate.setSeconds(0);
			//weekDate.setMilliseconds(0);

			this.renderWeek(weekDate);
			for (var i = 0; i < initialWeekCount; i++) {
			    weekDate.setDate(weekDate.getDate() + 7);
			    this.renderWeek(weekDate);
			}

			var firstVisibleWeek = _weekElements[0].timestamp;
			var currentMonth = this.model.get('monthNames')[firstVisibleWeek.getMonth()];
			_$monthName.text(currentMonth);
		},

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
			'click .day': 'onDayClick'
		},

		onDayClick: function(e) {
			var dayCode = $(e.target).data('day-code');
			this.model.onDayClick(dayCode);
		},
		///////////////////////////////////////////////////////////////////////
		
		// MODEL EVENTS ///////////////////////////////////////////////////////

		///////////////////////////////////////////////////////////////////////
		
		onScroll: function() {
			var scrollTop = _$window.scrollTop();
			if (!_heightOfOneWeek) {
				_heightOfOneWeek = _$calendar.find('.day_wrap:eq(0)').height();
				//console.log(_heightOfOneWeek);
			}
			if (Math.abs(scrollTop - _prevY) > _heightOfOneWeek / 2) {
				var hiddenWeekCount = Math.ceil(scrollTop / _heightOfOneWeek);
				var firstVisibleWeek = _weekElements[hiddenWeekCount].timestamp;
				var currentMonth = this.model.get('monthNames')[firstVisibleWeek.getMonth()];
				_prevY = _$window.scrollTop();
				_$monthName.text(currentMonth);
				//console.log('update ' + currentMonth);
			}
		},

		renderWeek: function(weekDate) {
			if (!_template) {
				//_template = _.template($("#template_week").html());
				_template = _.template(WeekTemplate);
			}
			var weekDateCopy = new Date(weekDate);

	        var days = {};
	        var dayCodes = {};
	        days['d0'] = weekDateCopy.getDate();
	        dayCodes['d0'] = weekDateCopy.toISOString().split('T')[0];
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d1'] = weekDateCopy.getDate();
	       	dayCodes['d1'] = weekDateCopy.toISOString().split('T')[0];
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d2'] = weekDateCopy.getDate();
	     	dayCodes['d2'] = weekDateCopy.toISOString().split('T')[0];
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d3'] = weekDateCopy.getDate();
	        dayCodes['d3'] = weekDateCopy.toISOString().split('T')[0];
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d4'] = weekDateCopy.getDate();
	        dayCodes['d4'] = weekDateCopy.toISOString().split('T')[0];
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d5'] = weekDateCopy.getDate();
	        dayCodes['d5'] = weekDateCopy.toISOString().split('T')[0];
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d6'] = weekDateCopy.getDate();
	        dayCodes['d6'] = weekDateCopy.toISOString().split('T')[0];
	        
	        var el = _template({ days: days, dayCodes: dayCodes });
	        _weekElements.push({
	        	htmlEl: el,
	        	timestamp: new Date(weekDate)
	        });
	       _$calendar.append(el);
		},

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);

			//console.log('calendar view init');
			var options = options || {};

			//this.model.bind('change', render);
			_$window = $(window);
			_$calendar = this.$el.find('#calendar');
			_$monthName = $('#month_name');
			_prevY = _$window.scrollTop();
			_weekElements = [];

			// can't be registered within View.events
			_$window.scroll(this.onScroll);
		}	

	});

	return CalendarView;

});