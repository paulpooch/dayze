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

	var that,
		_accountView,
		_calendarView,
		_dayView;

	var AppView = Backbone.View.extend({

		initialize: function(options) {
			that = this;

			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			
			var options = options || {};

			console.log(this.model.get('dayModel').get('dayCode'));

			_calendarView = new CalendarView({ app: this, model: this.model.get('calendarModel'), appModel: this.model, el: $('#calendar_view_holder') });
			_accountView = new AccountView({ app: this, model: this.model.get('accountModel'), appModel: this.model, el: $('#account_view_holder') });
			_dayView = new DayView({ app: this, model: this.model.get('dayModel'), appModel: this.model, el: $('#day_view_holder') });

			this.model.on('change:dayModalVisible', function() {
				console.log(that.model.get('dayModalVisible'));
				if (that.model.get('dayModalVisible')) {
					$('#myModal').modal('show');
					//window.location.hash = '#myModal';
				}    	
			});

			this.render();
		},

		render: function() {
			_calendarView.render();
		}

	});

	return AppView;

});