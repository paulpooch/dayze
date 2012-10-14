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

	var that;

	var AppView = Backbone.View.extend({

		render: function() {
			this.model.renderCalendarView();
		},

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
			'hide #day_view_holder': 'onModalHide'
		},

		onModalHide: function() {
			this.model.set('dayModalVisible', false);
		},
		///////////////////////////////////////////////////////////////////////

		// MODEL EVENTS ///////////////////////////////////////////////////////
		onDayModalVisibleChange: function() {
			if (that.model.get('dayModalVisible')) {
				$('#day_view_holder').modal('show');
			}
		},
		///////////////////////////////////////////////////////////////////////

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			that = this;
			
			options = options || {};		
			this.model.on('change:dayModalVisible', that.onDayModalVisibleChange);

			this.render();
		}

	});

	return AppView;

});