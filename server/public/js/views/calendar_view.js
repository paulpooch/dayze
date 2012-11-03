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

	var that,
		_appModel,
		_eventCollection,
		_heightOfOneWeek,
		_prevY,
		_weekElements,
		_template,
		_yFirstWeek,
		_yLastWeek,
		_heightOfHeader = 50,
		
		_$window,
		_$calendar,
		_$monthName,
		_$yearName,
		_$monthDropdown;
	

	var CalendarView = Backbone.View.extend({

		render: function() {
			that.jumpToDate(new Date());
			/*
			var weekDate = new Date();
			var day = weekDate.getDay();
			var diff = weekDate.getDate() - day;
			weekDate.setDate(diff);
			weekDate = new Date(weekDate.getFullYear(), weekDate.getMonth(), weekDate.getDate(), 0, 0, 0, 0);
			that.jumpToDate(weekDate);
			*/
		},

		jumpToDate: function(weekDate) {
			_$calendar.empty();
			
			var weekLimit = _appModel.get('WEEK_SCROLL_BUFFER');
			var howFarBack = _appModel.get('PAST_WEEKS_TO_SHOW');
			var start = new Date(weekDate);
			start.setDate(-7 * howFarBack);
			// Make sure monday is lined up.
			var day = start.getDay(); // Day of week.
			var diff = start.getDate() - day;
			start.setDate(diff);

			_weekElements = [];
			var direction = 1; // Forward.
			that.renderXWeeks(start, weekLimit, direction);
			that.scrollToDay(weekDate);
		},

		renderXWeeks: function(startDate, x, direction, alsoRemove) {
			var diff = (direction) ? +7 : -7 ;
			for (var i = 0; i < x; i++) {
				that.renderWeek(startDate, direction, alsoRemove);
				startDate.setDate(startDate.getDate() + diff);
			}
			that.setYLimits();
		},

		setYLimits: function() {
			var weeks = _$calendar.find('.week');
			_yFirstWeek = $(weeks).eq(0).offset().top;
			_yLastWeek = $(weeks).eq(weeks.length - 1).offset().top;
		},

		scrollToDay: function(dayDate) {
			var dayCode = dayDate.toISOString().split('T')[0];
			var offset = $('.day[data-day-code=' + dayCode + ']').offset().top - _heightOfHeader;
			_$window.scrollTop(offset);
			that.setActiveMonth(dayDate.getMonth() + 1, dayDate.getFullYear());
		},

		setActiveMonth: function(monthNum, yearNum) {
			var currentMonthText = that.model.get('monthNames')[monthNum - 1];
			_$monthName.text(currentMonthText);
			_$yearName.text(yearNum);

			var monthCode = yearNum + '-' + monthNum;
			that.model.set('monthCode', monthCode);

			_$monthDropdown.find('li').removeClass('disabled');
			_$monthDropdown.find('li[data-month-num=' + monthNum + ']').addClass('disabled');
		},

		infiniteScroll: function(direction) {
			var alsoRemove = true;
			if (direction) {
				// Forwards.
				// Must be wrapped in Date constructor to prevent the world's most obscure bug.
				var nextDate = new Date(_weekElements[_weekElements.length - 1].timestamp);
				var currDate = new Date(_weekElements[_weekElements.length - 2].timestamp);
				nextDate.setDate(nextDate.getDate() + 7);
				that.renderXWeeks(nextDate, 10, direction, alsoRemove);
				that.scrollToDay(currDate);
			} else {
				// Backwards.
				// Must be wrapped in Date constructor to prevent the world's most obscure bug.
				var nextDate = new Date(_weekElements[0].timestamp);
				var currDate = new Date(_weekElements[1].timestamp);
				nextDate.setDate(nextDate.getDate() - 7);
				that.renderXWeeks(nextDate, 10, direction, alsoRemove);
				that.scrollToDay(currDate);
			}
		},

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
			'click .day': 'onDayClick'
		},

		onDayClick: function(e) {
			var dayCode = $(e.target).data('day-code');
			_appModel.displayDay(dayCode);
		},

		onMonthDropdownSelect: function(e) {
			var monthNum = $(e.target).parent().data('month-num');
			var yearNum = that.model.get('monthCode').split('-')[0];
			var targetDate = new Date(yearNum, monthNum - 1, 1);
			that.jumpToDate(targetDate);
		},

		onMonthNameClick: function() {
			_$monthDropdown.toggle();
		},

		onYearNameClick: function() {
			_$yearDropdown.toggle();
		},
		///////////////////////////////////////////////////////////////////////
		
		// MODEL EVENTS ///////////////////////////////////////////////////////
		onEventCollectionReset: function() {
			var alreadyResetDays = {};
			_eventCollection.each(function(event) {
				var dayCode = event.get('eventTime').split('T')[0];
				var dayEl = $('.day[data-day-code=' + dayCode + ']');
				if (!alreadyResetDays[dayCode]) {
					alreadyResetDays[dayCode] = 1;
					dayEl.find('.event_holder').empty();
				}
				dayEl
				.addClass('has_event')
				.find('.event_holder')
				.append('<div class="label label-info">' + event.get('name') + '</div>');
			});
		},
		///////////////////////////////////////////////////////////////////////
		
		onScroll: function() {
			var scrollTop = _$window.scrollTop();
			if (!_heightOfOneWeek) {
				_heightOfOneWeek = _$calendar.find('.day_wrap:eq(0)').height();
			}
			if (Math.abs(scrollTop - _prevY) > _heightOfOneWeek / 2) {
				_scrollDisabled = true;
				_prevY = _$window.scrollTop();
				var hiddenWeekCount = Math.ceil(scrollTop / _heightOfOneWeek);
				
				// We cheat and consider the second displayed week for Month display.
				// Things make more sense this way.  Hence the ++ below.
				if (hiddenWeekCount != _weekElements.length - 1) {
					hiddenWeekCount++;
				}
				
				if (scrollTop >= _yLastWeek - 500) {
					that.infiniteScroll(1);	
				} else if (scrollTop <= _yFirstWeek + 500) {
					that.infiniteScroll(0);	
				} else {
					var firstVisibleWeek = _weekElements[hiddenWeekCount].timestamp;
					console.log('Neither.', 'hiddenweekcount', hiddenWeekCount, 'firstVisibleWeek', firstVisibleWeek);
					that.setActiveMonth(firstVisibleWeek.getMonth() + 1, firstVisibleWeek.getFullYear());
				}
			}
		},

		renderWeek: function(weekDate, forwards, alsoRemove) {
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
			if (forwards) {
	        	_weekElements.push({
	        		htmlEl: el,
	        		timestamp: new Date(weekDate)
	        	});
	        	_$calendar.append(el);
	        	if (alsoRemove) {
	        		_weekElements.shift();
	        		_$calendar.find('div.week:first').remove();
	        	}
	       	} else {
	       		_weekElements.unshift({
	        		htmlEl: el,
	        		timestamp: new Date(weekDate)
	        	});
	        	_$calendar.prepend(el);
	        	if (alsoRemove) {
	        		_weekElements.pop();
	        		_$calendar.find('div.week').eq(_weekElements.length - 1).remove();
	        	}
	       	}
		},

		initialize: function(options) {
			_.bindAll(this);
			that = this;

			var options = options || {};
			_appModel = options.appModel;
			_eventCollection = _appModel.get('eventCollection');

			//this.model.bind('change', render);
			_$window = $(window);
			_$calendar = that.$el.find('#calendar');
			_$monthName = $('#month_name');
			_$yearName = $('#year_name');
			_$monthDropdown = $('#month_dropdown');
			_prevY = _$window.scrollTop();

			// BINDINGS
			// Most of these reach into header bar (global els), not limited to $el.
			_$window.scroll(that.onScroll);
			_$monthDropdown.on('click', 'li', that.onMonthDropdownSelect);
			_$monthName.parents('.month_button').on('click', that.onMonthNameClick);
			_$yearName.parents('.month_button').on('click', that.onYearNameClick);
			_eventCollection.on('reset', that.onEventCollectionReset);

			// Dropdown positioning bs.  Can we do this without js?
			var dropdowns = $('.month_button .dropdown-menu');
			for (var i = 0; i < dropdowns.length; i++) {
				var left = dropdowns[i].parentNode.offsetLeft;
				$(dropdowns[i]).css({ left: left + 'px' });
			}

		}	

	});

	return CalendarView;

});