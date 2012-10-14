///////////////////////////////////////////////////////////////////////////////
// EVENT VIEW
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',

	'text!templates/event_template.html',
], function(
	jQuery,
	_,
	Backbone,

	EventTemplate
) {

	var that,
		_app,
		_appModel;

	var EventView = Backbone.View.extend({

		template: _.template(EventTemplate),

		render: function() {
			console.log('EventView.render');
			this.$el.html(that.template(that.model.toJSON()));
		},

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
			
		},
		// END VIEW EVENTS ////////////////////////////////////////////////////

		// MODEL EVENTS ///////////////////////////////////////////////////////
		update: function() {
			
			that.render();
		},
		// END MODEL EVENTS ///////////////////////////////////////////////////

		setModel: function(m) {
			that.model = m;
			that.update();
		},

		setElAndRender: function(el) {
			that.$el = el;
			that.update();
		},

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			
			// VARS
			that = this;
			_app = options.app;
			_appModel = options.appModel;
			
			// BINDINGS
			that.update();
		}

	});

	return EventView;

});