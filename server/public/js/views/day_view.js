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
			'click #addEventButton': 'onAddEventButtonClick'
		},

		onAddEventButtonClick: function() {
			var eventText = this.$el.find('#addEventText').val();
			var dayCode = this.model.get('dayCode');
			console.log(dayCode);
			_appModel.addEvent(eventText, dayCode);
		},

		render: function() {
			console.log('render day');
			console.log(this.model.toJSON());
			this.$el.html(this.template(this.model.toJSON()));
		},

		update: function() {
			console.log('day view update');
			console.log('update day view');
			var dayCode = this.model.get('dayCode');
			console.log('dayCode is ', dayCode);
			console.log('calEvents are ', this.model.get('calEvents'));
			console.log('json', this.model.toJSON());
			this.render();
		},

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			that = this;

			options = options || {};
			_app = options.app;
			_appModel = options.appModel;
			
			this.model.on('change:dayCode', this.update);
			this.model.on('change:calEvents', this.update);


			this.update();
		}

	});

	return DayView;

});