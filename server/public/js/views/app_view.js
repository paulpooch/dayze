///////////////////////////////////////////////////////////////////////////////
// APP VIEW
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',
	'c'
], function(
	jQuery,
	_,
	Backbone,
	C
) {

	var that,
		_$pageViewHolder,
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
				case C.ActiveViews.Calendar:
					_$pageViewHolder.hide();
					_$calendarViewHolder.show();
					break;
				case C.ActiveViews.Account:
				case C.ActiveViews.Day:
				case C.ActiveViews.Basic:
					_$calendarViewHolder.hide();
					_$pageViewHolder.show();
					break;
			}
		},
		///////////////////////////////////////////////////////////////////////

		initialize: function(options) {
			_.bindAll(this);
			that = this;
			
			options = options || {};
			_$calendarViewHolder = $('#calendar_view_holder');
			// make this pageviewholder
			_$pageViewHolder = $('#page_holder');

			// MODEL EVENTS
			that.model.on('change:activeView', that.onActiveViewChange);
			that.onActiveViewChange();
			that.render();
		}

	});

	return AppView;

});