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
			this.model.on('change:dayModalVisible', that.onDayModalVisibleChange);

			this.render();
		},

		render: function() {
			this.model.renderCalendarView();
		}

	});

	return AppView;

});