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

		events: {
			'hide #day_view_holder': 'onModalHide'
		},

		onModalHide: function() {
			console.log('day modal visibility = ', this.model.get('dayModalVisible'));
			this.model.set('dayModalVisible', false);
		},

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			that = this;
			
			options = options || {};

			console.log(this.model.get('dayModel').get('dayCode'));

			_calendarView = new CalendarView({ app: this, model: this.model.get('calendarModel'), appModel: this.model, el: $('#calendar_view_holder') });
			_accountView = new AccountView({ app: this, model: this.model.get('accountModel'), appModel: this.model, el: $('#account_view_holder') });
			_dayView = new DayView({ app: this, model: this.model.get('dayModel'), appModel: this.model, el: $('#day_view_holder') });

			this.model.on('change:dayModalVisible', function() {
				console.log(that.model.get('dayModalVisible'));
				if (that.model.get('dayModalVisible')) {
					$('#day_view_holder').modal('show');
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