///////////////////////////////////////////////////////////////////////////////
// EVENT VIEW
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',
	'google',

	'text!templates/event_template.html',
], function(
	jQuery,
	_,
	Backbone,
	Google,

	EventTemplate
) {

	var that,
		_appModel,
		_delayedMapAction;

	var EventView = Backbone.View.extend({

		template: _.template(EventTemplate),

		render: function() {
			that.$el.html(that.template(that.model.toJSON()));
		},

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
			'keyup #location': 'mapLocation',
			'change input': 'syncForm',
			'change textarea': 'syncForm',
			'click #location_button': 'mapLocation'
		},

		syncForm: function(e) {
			var target = $(e.currentTarget);
      		var data = {};
      		data[target.attr('id')] = target.val();
      		this.model.set(data);
		},

		mapLocation: function() {
			console.log('WARNING - mapLocation is currently useless.')
			if (_delayedMapAction) {
				clearTimeout(_delayedMapAction);
			}
			_delayedMapAction = setTimeout(function() {
				var loc = $('#location').val();
				console.log(loc);
			}, 2000);
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
			that.addMap();	
		},

		addMap: function() {
			setTimeout(function() {
				Google.Maps.addMapToCanvas($('#event_map').get(0));
				Google.Maps.setupGeocodeAutocomplete($('#location').eq(0));
			}, 1000);	
		},

		setElAndRender: function(el) {
			that.$el = el;
			that.delegateEvents(); // Must occur whenever we change $el or 'events' won't work.
			that.update();
		},

		initialize: function(options) {
			_.bindAll(this);
			that = this;

			_appModel = options.appModel;

			// BINDINGS
			that.update();
		}

	});

	return EventView;

});