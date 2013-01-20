///////////////////////////////////////////////////////////////////////////////
// EVENT VIEW
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',
	'google',

	'text!templates/event_template.html',
	'text!templates/autosuggest_item_template.html',
	'text!templates/invite_item_template.html',
	'smart_form',
	'c'
], function(
	jQuery,
	_,
	Backbone,
	Google,

	EventTemplate,
	AutosuggestItemTemplate,
	InviteItemTemplate,
	SmartForm,
	C
) {

	var that,
		_appModel,
		_delayedMapAction,
		_$eventForm,
		_eventForm,
		_$inviteListCol1,
		_$inviteListCol2,
		_autosuggestItemTemplate,
		_inviteItemTemplate;

	var EventView = Backbone.View.extend({

		template: _.template(EventTemplate),

		render: function() {
			that.$el.html(that.template(that.model.toJSON()));
			_$eventForm = that.$el.find('#event_create_form');
			_eventForm = new SmartForm(that.model, _$eventForm, _appModel.saveEvent);
			that.reInitScrollSpy();

			_$inviteListCol1 = that.$el.find('.invite_list_col1');
			_$inviteListCol2 = that.$el.find('.invite_list_col2');
		},

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
			'keyup #location': 'mapLocation',
			'change input': 'syncForm',
			'change textarea': 'syncForm',
			'keypress #individual_text': 'onIndividualTextChange',
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

		reInitScrollSpy: function() {
			$('[data-spy="scroll"]').each(function () {
     			var $spy = $(this)
      			$spy.scrollspy($spy.data())
    		});
		},

		onAddIndividualClick: function() {
			var val = $('#individual_text').val();
			that.model.addToInvited(val);
		},

		onIndividualTextChange: function(e) {
			var code = e.which;
			if (code == C.KEY_ENTER) {
				that.onAddIndividualClick();
			}
		},
		///////////////////////////////////////////////////////////////////////

		// MODEL EVENTS ///////////////////////////////////////////////////////
		renderInvited: function() {

			_$inviteListCol1.empty();
			_$inviteListCol2.empty();

			var invited = that.model.get('invited');
			invited = _.keys(invited);
			for (var i = 0; i < invited.length; i++) {
				var data = { name: invited[i] };
				var html = _inviteItemTemplate(data);
				if (i % 2) {
					_$inviteListCol2.append(html);
				} else {
					_$inviteListCol1.append(html);
				}
			}

		},
		///////////////////////////////////////////////////////////////////////

		setModel: function(m) {
			that.model = m;
			that.render();
			that.addMap();

			// BINDINGS
			that.model.bind('change:invited', that.renderInvited);
		},

		getModel: function() {
			return that.model;
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

			_autosuggestItemTemplate = _.template(AutosuggestItemTemplate);
			_inviteItemTemplate = _.template(InviteItemTemplate);
			_appModel = options.appModel;
		}

	});

	return EventView;

});