///////////////////////////////////////////////////////////////////////////////
// CALENDAR VIEW
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',

	'c',
	'text!templates/week_template.html'
], function(
	jQuery,
	_,
	Backbone,

	C,
	WeekTemplate
) {

	var that,
		_appModel,
		_eventCollection,
		_heightOfOneWeek,
		_weekElements,
		_template,
		_heightOfHeader = 50,
		_isActiveView = false,
		
		_$window,
		_$document,
		_$calendar,
		_$monthName,
		_$yearName,
		_$monthDropdown,
		_$yearDropdown,
		_$headerEls;
	
	var CalendarView = Backbone.View.extend({

		render: function() {
			setTimeout(function() { that.jumpToDate(new Date()); }, 50 );
		},

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
			'click .day': 'onDayClick'
		},

		onDayClick: function(e) {
			var dayCode = $(e.target).data('day-code');
			_appModel.navigateToDay(dayCode);
		},

		onMonthDropdownSelect: function(e) {
			var monthNum = $(e.target).parent().data('month-num');
			var yearNum = that.model.get('monthCode').split('-')[0];
			var targetDate = new Date(yearNum, monthNum - 1, 1);
			that.jumpToDate(targetDate);
		},

		onYearDropdownSelect: function(e) {
			var monthNum = that.model.get('monthCode').split('-')[1];
			var yearNum = $(e.target).parent().data('year-num');
			var targetDate = new Date(yearNum, monthNum - 1, 1);
			that.jumpToDate(targetDate);
		},

		onMonthNameClick: function() {
			_$yearDropdown.hide();
			_$monthDropdown.show();
		},

		onYearNameClick: function() {
			_$monthDropdown.hide();
			_$yearDropdown.show();
		},

		hideAllDropdowns: function() {log(2);
			_$monthDropdown.hide();
			_$yearDropdown.hide();
		},

		onScroll: function() {
			if (_isActiveView) {
				var scrollTop = _$window.scrollTop();
				if (!_heightOfOneWeek) {
					_heightOfOneWeek = _$calendar.find('.day_wrap:eq(0)').height();
				}
				var hiddenWeekCount = Math.ceil(scrollTop / _heightOfOneWeek);				
				if (scrollTop >= _$document.height() - _$window.height() - 200) {
	  				that.infiniteScroll(1);	
				} else if (scrollTop <= 200) {
					that.infiniteScroll(0);	
				} else {
					var firstVisibleWeek = _weekElements[hiddenWeekCount].timestamp;
					var firstVisibleMonth = new Date(firstVisibleWeek);
					firstVisibleMonth.setDate(firstVisibleMonth.getDate() + 6);
					that.setActiveMonth(firstVisibleMonth.getMonth() + 1, firstVisibleMonth.getFullYear());
				}
			}
		},
		///////////////////////////////////////////////////////////////////////

		// MODEL EVENTS ///////////////////////////////////////////////////////
		onEventCollectionReset: function() {
			var alreadyResetDays = {};
			_eventCollection.each(function(event) {
				var dayCode = event.get('dayCode');
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

		onActiveViewChange: function() {
			if (_appModel.get('activeView') == C.ActiveViews.Calendar) {
				_$headerEls.show();	
				that.doUiTweaks();
				_isActiveView = true;
			} else {
				_$headerEls.hide();
				_isActiveView = false;
			}
		},
		///////////////////////////////////////////////////////////////////////

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

			// Another mystery delay.
			setTimeout(function() {
				that.hideAllDropdowns();
			}, 100);
		},

		renderXWeeks: function(startDate, x, direction, alsoRemove) {
			var diff = (direction) ? +7 : -7 ;
			for (var i = 0; i < x; i++) {
				that.renderWeek(startDate, direction, alsoRemove);
				startDate.setDate(startDate.getDate() + diff);
			}
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
			that.displayYear(yearNum);

			if (monthNum < 10) {
				monthNum = '0' + monthNum;
			}
			var monthCode = yearNum + '-' + monthNum;
			that.model.set('monthCode', monthCode);

			_$monthDropdown.find('li').removeClass('disabled');
			_$monthDropdown.find('li[data-month-num=' + monthNum + ']').addClass('disabled');
		},

		displayYear: function(yearNum) {
			_$yearName.text(yearNum);
			var y = Number(yearNum);
			var html = [];
			for (var i = y - 3; i < y + 5; i++) {
				if (i == y) {
					html.push('<li data-year-num="' + i + '" class="disabled"><a href="#">' + i + '</a></li>');
				} else {
					html.push('<li data-year-num="' + i + '"><a href="#">' + i + '</a></li>');
				}
			}
			_$yearDropdown.html(html.join(''));
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

		doUiTweaks: function() {
			// Dropdown positioning bs.  Can we do this without js?
			var dropdowns = $('.month_button .dropdown-menu');
			for (var i = 0; i < dropdowns.length; i++) {
				var left = dropdowns[i].parentNode.offsetLeft;
				$(dropdowns[i]).css({ left: left + 'px' });
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
	        var monthCodes = {};
	        days['d0'] = weekDateCopy.getDate();
	        dayCodes['d0'] = weekDateCopy.toISOString().split('T')[0];
	        monthCodes['d0'] = dayCodes['d0'].substr(0, 7);
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d1'] = weekDateCopy.getDate();
	       	dayCodes['d1'] = weekDateCopy.toISOString().split('T')[0];
	       	monthCodes['d1'] = dayCodes['d1'].substr(0, 7);
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d2'] = weekDateCopy.getDate();
	     	dayCodes['d2'] = weekDateCopy.toISOString().split('T')[0];
	     	monthCodes['d2'] = dayCodes['d2'].substr(0, 7);
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d3'] = weekDateCopy.getDate();
	        dayCodes['d3'] = weekDateCopy.toISOString().split('T')[0];
	        monthCodes['d3'] = dayCodes['d3'].substr(0, 7);
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d4'] = weekDateCopy.getDate();
	        dayCodes['d4'] = weekDateCopy.toISOString().split('T')[0];
	        monthCodes['d4'] = dayCodes['d4'].substr(0, 7);
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d5'] = weekDateCopy.getDate();
	        dayCodes['d5'] = weekDateCopy.toISOString().split('T')[0];
	        monthCodes['d5'] = dayCodes['d5'].substr(0, 7);
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d6'] = weekDateCopy.getDate();
	        dayCodes['d6'] = weekDateCopy.toISOString().split('T')[0];
	        monthCodes['d6'] = dayCodes['d6'].substr(0, 7);
	        
	        var el = _template({ days: days, dayCodes: dayCodes, monthCodes: monthCodes });
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

		onMonthLoaded: function(monthCode) {
			$('.day[data-month-code=' + monthCode + ']').addClass('loaded');
		},

		initialize: function(options) {
			_.bindAll(this);
			that = this;

			_appModel = options.appModel;
			_eventCollection = _appModel.get('eventCollection');
			_$window = $(window);
			_$document = $(document);
			_$calendar = that.$el.find('#calendar');
			_$monthName = $('#month_name');
			_$yearName = $('#year_name');
			_$monthDropdown = $('#month_dropdown');
			_$yearDropdown = $('#year_dropdown');
			_$headerEls = $('.calendar_view_header');
			_prevY = _$window.scrollTop();

			// VIEW EVENTS
			// Most of these reach into header bar (global els), not limited to $el.
			_$window.scroll(that.onScroll);
			_$monthDropdown.on('click', 'li', that.onMonthDropdownSelect);
			_$yearDropdown.on('click', 'li', that.onYearDropdownSelect);
			_$monthName.closest('.month_button').on('click', that.onMonthNameClick);
			_$yearName.closest('.month_button').on('click', that.onYearNameClick);
			// MODEL EVENTS
			_eventCollection.on('reset', that.onEventCollectionReset);
			_appModel.bind('change:activeView', that.onActiveViewChange);
		}	

	});

	return CalendarView;

});