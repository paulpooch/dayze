///////////////////////////////////////////////////////////////////////////////
// EVENT VIEW
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',
	'google',

	'text!templates/event_template.html',
	'smart_form'
], function(
	jQuery,
	_,
	Backbone,
	Google,

	EventTemplate,
	SmartForm
) {

	var that,
		_appModel,
		_delayedMapAction,
		_$eventForm,
		_eventForm;

	var EventView = Backbone.View.extend({

		template: _.template(EventTemplate),

		render: function() {
			that.$el.html(that.template(that.model.toJSON()));
			_$eventForm = that.$el.find('#event_create_form');
			_eventForm = new SmartForm(that.model, _$eventForm, _appModel.saveEvent);
			this.$el.scrollspy('refresh');
		},

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
			'keyup #location': 'mapLocation',
			'change input': 'syncForm',
			'change textarea': 'syncForm',
			'click #location_button': 'mapLocation',
		},

		syncForm: function(e) {
			var target = $(e.currentTarget);
      		var data = {};
      		data[target.attr('id')] = target.val();
      		that.model.set(data);
		},

		mapLocation: function() {
log('WARNING - mapLocation is currently useless.')
			if (_delayedMapAction) {
				clearTimeout(_delayedMapAction);
			}
			_delayedMapAction = setTimeout(function() {
				var loc = $('#location').val();
			}, 2000);
		},
		///////////////////////////////////////////////////////////////////////

		// MODEL EVENTS ///////////////////////////////////////////////////////

		///////////////////////////////////////////////////////////////////////

		setModel: function(m) {
			that.model = m;
			that.render();
			that.addMap();
		},

		addMap: function() {
/*
				setTimeout(function() {
					Google.Maps.addMapToCanvas($('#event_map').get(0));
					Google.Maps.setupGeocodeAutocomplete($('#location').eq(0));
				}, 1000);	
*/
		},

		setElAndRender: function(el) {
			that.$el = el;
			that.delegateEvents(); // Must occur whenever we change $el or 'events' won't work.
			that.render();
		},

		initialize: function(options) {
			_.bindAll(this);
			that = this;

			_appModel = options.appModel;
		}

	});

	return EventView;

});