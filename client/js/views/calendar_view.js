define(['jquery', 'underscore', 'backbone'], function(jQuery, _, Backbone) {

	var _app;

	var _$window;
	var _$calendar;
	var _$monthName;
	var _heightOfOneWeek;
	var _prevY;
	var _weekElements;
	var _template;

	var CalendarView = Backbone.View.extend({

		defaults: function() {
			return { };
		},

		initialize: function(options) {
			var options = options || {};
			_app = options.app;
			// model automatically get assigned

			_.bindAll(this); // binds all event callbacks to 'this'

			//this.model.bind('change', render);
			_$window = $(window);
			_$calendar = this.$el.find('#calendar');
			_$monthName = this.$el.find('#month_name');
			_heightOfOneWeek = _$calendar.find('.day_wrap:eq(0)').height();
			_prevY = _$window.scrollTop();
			_weekElements = [];

			// can't be registered within View.events
			_$window.scroll(this.handleScroll);
		},

		events: function() {
			return {
				'click .day': 'showDay'
			};
		},

		render: function() {
			var initialWeekCount = 20;
			var weekDate = new Date();
			var day = weekDate.getDay();
			var diff = weekDate.getDate() - day;
			weekDate.setDate(diff);

			this.showWeek(weekDate);
			for (var i = 0; i < initialWeekCount; i++) {
			    weekDate.setDate(weekDate.getDate() + 7);
			    this.showWeek(weekDate);
			}

			var firstVisibleWeek = _weekElements[0].timestamp;
			var currentMonth = this.model.get('monthNames')[firstVisibleWeek.getMonth()];
			_$monthName.text(currentMonth);
		},

		handleScroll: function() {
			var scrollTop = _$window.scrollTop();
			if (Math.abs(scrollTop - _prevY) > _heightOfOneWeek / 2) {
				var hiddenWeekCount = Math.ceil(scrollTop / _heightOfOneWeek);
				var firstVisibleWeek = _weekElements[hiddenWeekCount].timestamp;
				var currentMonth = this.model.get('monthNames')[firstVisibleWeek.getMonth()];
				_prevY = _$window.scrollTop();
				_$monthName.text(currentMonth);
				console.log('update ' + currentMonth);
			}
		},

		showDay: function() {
			console.log('showDay()');
		},

		showWeek: function(weekDate) {
			if (!_template) {
				_template = _.template($("#template_week").html());
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