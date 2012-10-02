///////////////////////////////////////////////////////////////////////////////
// DAY VIEW
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',

	'text!templates/day_template.html',
], function(
	jQuery,
	_,
	Backbone,

	DayTemplate
) {

	var that,
		_app,
		_appModel;

	var DayView = Backbone.View.extend({

		template: _.template(DayTemplate),

		events: {
			'hide #myModal': 'onModalHide',
			'click #addEventButton': 'onAddEventButtonClick'
		},

		onModalHide: function() {
			_appModel.set('dayModalVisible', false);
		},

		onAddEventButtonClick: function() {
			var eventText = this.$el.find('#addEventText').val();
			_appModel.addEvent(eventText);
		},

		render: function() {
			console.log('render day');
			this.$el.html(this.template(this.model.toJSON()));
		},

		update: function() {
			console.log('day view update');
			console.log('update day view');
			var dayCode = this.model.get('dayCode');
			console.log('dayCode is ', dayCode);
			this.render();
		},

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			that = this;

			var options = options || {};
			_app = options.app;
			_appModel = options.appModel;
			
			this.model.on('change:dayCode', this.update);
			this.update();
		}

	});

	return DayView;

});