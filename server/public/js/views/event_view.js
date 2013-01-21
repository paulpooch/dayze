///////////////////////////////////////////////////////////////////////////////
// EVENT VIEW
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',
	'google',

	'auto_suggest',
	'text!templates/event_template.html',
	'text!templates/invite_item_template.html',
	'smart_form',
	'c'
], function(
	jQuery,
	_,
	Backbone,
	Google,

	AutoSuggest,
	EventTemplate,
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
		_inviteItemTemplate,
		_friendAutoSuggest;

	var EventView = Backbone.View.extend({

		template: _.template(EventTemplate),

		render: function() {
			that.$el.html(that.template(that.model.toJSON()));

			_$eventForm = that.$el.find('#event_create_form');
			_eventForm = new SmartForm(that.model, _$eventForm, _appModel.saveEvent);
			that.reInitScrollSpy();

			_$inviteListCol1 = that.$el.find('.invite_list_col1');
			_$inviteListCol2 = that.$el.find('.invite_list_col2');

			var inputText = that.$el.find('#individual_text');
			var resultsBox = that.$el.find('#individual_results');
			var autoSuggestEls = {
				inputText: inputText,
				resultsBox: resultsBox
			};
			_friendAutoSuggest.updateEls(autoSuggestEls);

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

			_inviteItemTemplate = _.template(InviteItemTemplate);
			_appModel = options.appModel;

			_friendAutoSuggest = new AutoSuggest(_appModel.get('friendCollection'), 'friend');
		}

	});

	return EventView;

});