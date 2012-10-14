///////////////////////////////////////////////////////////////////////////////
// APP VIEW
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',

	'views/account_view',
	'views/calendar_view',
	'views/day_view',
	'views/event_view'
], function(
	jQuery,
	_,
	Backbone,

	AccountView,
	CalendarView,
	DayView,
	EventView
) {

	var that,
		_mediator,
		_accountView,
		_calendarView,
		_dayView;

	var AppView = Backbone.View.extend({

		events: {
			'hide #day_view_holder': 'onModalHide'
		},

		onModalHide: function() {
			//console.log('day modal visibility = ', this.model.get('dayModalVisible'));
			this.model.set('dayModalVisible', false);
		},

		onDayModalVisibleChange: function() {
			if (that.model.get('dayModalVisible')) {
				$('#day_view_holder').modal('show');
				//window.location.hash = '#myModal';
			}
		},

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			that = this;
			
			options = options || {};
			_mediator = options.mediator;

			_calendarView = new CalendarView({ app: this, model: this.model.get('calendarModel'), appModel: this.model, el: $('#calendar_view_holder') });
			_accountView = new AccountView({ app: this, model: this.model.get('accountModel'), appModel: this.model, el: $('#account_view_holder') });
			_eventView = new EventView({ app: this, model: this.model.get('eventModel'), appModel: this.model, el: $('#event_view_holder') });
			_mediator.setEventView(_eventView);
			_dayView = new DayView({ app: this, model: this.model.get('dayModel'), appModel: this.model, el: $('#day_view_holder'), mediator: _mediator });
	
			
			this.model.on('change:dayModalVisible', that.onDayModalVisibleChange);

			this.render();
		},

		render: function() {
			_calendarView.render();
		}

	});

	return AppView;

});