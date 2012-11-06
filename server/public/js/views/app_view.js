///////////////////////////////////////////////////////////////////////////////
// APP VIEW
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone'
], function(
	jQuery,
	_,
	Backbone
) {

	var that,
		_$dayViewHolder,
		_$calendarViewHolder;

	var AppView = Backbone.View.extend({

		render: function() {
			that.model.renderCalendarView();
		},

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
		},
		///////////////////////////////////////////////////////////////////////

		// MODEL EVENTS ///////////////////////////////////////////////////////
		onActiveViewChange: function() {
			var currentView = that.model.get('activeView');
			switch (currentView) {
				case 'calendar':
					_$dayViewHolder.hide();
					_$calendarViewHolder.show();
					that.model.get('dayModel').set('isActiveView', false);
					that.model.get('calendarModel').set('isActiveView', true);
					break;
				case 'day':
					_$calendarViewHolder.hide();
					_$dayViewHolder.show();
					that.model.get('calendarModel').set('isActiveView', false);
					that.model.get('dayModel').set('isActiveView', true);
					break;
			}
		},
		///////////////////////////////////////////////////////////////////////

		initialize: function(options) {
			_.bindAll(this);
			that = this;
			
			options = options || {};
			_$calendarViewHolder = $('#calendar_view_holder');
			_$dayViewHolder = $('#day_view_holder');

			// MODEL EVENTS
			that.model.on('change:activeView', that.onActiveViewChange);
			that.onActiveViewChange();
			that.render();
		}

	});

	return AppView;

});