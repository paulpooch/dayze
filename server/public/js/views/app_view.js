///////////////////////////////////////////////////////////////////////////////
// APP VIEW
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',

	'views/account_view',
	'views/calendar_view',
	'views/day_view'
], function(
	jQuery,
	_,
	Backbone,

	AccountView,
	CalendarView,
	DayView
) {

	var _accountView,
		_calendarView,
		_dayView;

	var AppView = Backbone.View.extend({

		initialize: function(options) {
			
			var options = options || {};

console.log(this.model.get('dayModel').get('dayCode'));

			_calendarView = new CalendarView({ app: this, model: this.model.get('calendarModel'), el: $('#calendar_view_holder') });
			_accountView = new AccountView({ app: this, model: this.model.get('accountModel'), el: $('#account_view_holder') });
			_dayView = new DayView({ app: this, model: this.model.get('dayModel'), el: $('#day_view_holder') })
		
			this.render();
		},

		render: function() {
			_calendarView.render();
		}

	});

	return AppView;

});