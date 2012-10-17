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
		_appModel;

	var EventView = Backbone.View.extend({

		template: _.template(EventTemplate),

		render: function() {
			this.$el.html(that.template(that.model.toJSON()));
		},

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
			'change input': 'syncForm',
			'change textarea': 'syncForm'
		},

		syncForm: function(e) {
			console.log(1);
			var target = $(e.currentTarget);
      		var data = {};
      		console.log(target, data);
      		data[target.attr('id')] = target.val();
      		this.model.set(data);
		},
		///////////////////////////////////////////////////////////////////////

		// MODEL EVENTS ///////////////////////////////////////////////////////
		update: function() {
			
			that.render();
		},
		///////////////////////////////////////////////////////////////////////

		setModel: function(m) {
			that.model = m;
			that.update();
		},

		setElAndRender: function(el) {
			that.$el = el;
			that.delegateEvents(); // Must occur whenever we change $el or 'events' won't work.
			that.update();
		},

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			
			// VARS
			that = this;
			_appModel = options.appModel;
			
			// BINDINGS
			that.update();
		}

	});

	return EventView;

});