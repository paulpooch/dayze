///////////////////////////////////////////////////////////////////////////////
// APP VIEW
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',

	'views/user_view',
	'views/calendar_view',
	'views/account_view',
], function(
	jQuery,
	_,
	Backbone,

	UserView,
	CalendarView,
	AccountView
) {

	var _appModel,
		_calendarView,
		_accountView;

	var AppView = Backbone.View.extend({

		initialize: function(options) {
			
			var options = options || {};
			_appModel = options.model;
			_calendarView = new CalendarView({ app: this, model: _appModel.get('calendarModel'), el: $('#container') });
			_accountView = new AccountView({ app: this, model: _appModel.get('accountModel'), el: $('#user_controls') });
		
			this.render();
		},

		render: function() {
			_calendarView.render();
		}

	});

	return AppView;

});