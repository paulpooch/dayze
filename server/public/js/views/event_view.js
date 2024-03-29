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
			var renderData = { 
				event: that.model.toJSON(),
				account: _appModel.get('accountModel').toJSON(),
				friendCollection: _appModel.get('friendCollection').toJSON()
			};
			that.$el.html(that.template(renderData));

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

			$('[rel=tooltip]').tooltip();
		},

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
			'keyup #location': 'mapLocation',
			'change input': 'syncForm',
			'change textarea': 'syncForm',
			'click #location_button': 'mapLocation',
			'click .invite_list .remove_invite': 'onRemoveInviteClick'
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

		onRemoveInviteClick: function(e) {
			var id = $(e.target).data('id');
			that.model.removeFromInvited(id);
		},
		///////////////////////////////////////////////////////////////////////

		// MODEL EVENTS ///////////////////////////////////////////////////////
		renderInvited: function() {

log('renderInvited');
			_$inviteListCol1.empty();
			_$inviteListCol2.empty();

			var inviteModels = that.model.get('inviteCollection').models;
			
			if (inviteModels.length > 0) {
				log(inviteModels[0]);
			}
			if (inviteModels.length > 1) {
				log(inviteModels[1]);
			}

			for (var x = 0; x < inviteModels.length; x++) {
				var m = inviteModels[x];
				log('model ', x, m);
				var data = m.toJSON();
				log('data ', x, data);
			}

			//var inviteModels = that.model.get('inviteCollection').models;

			//log('inviteModels 1', that.model.get('inviteCollection').models);
			//that.model.get('inviteCollection').each(function(inviteModel) {
			//	var data = inviteModel.toJSON();
				
				//var html = _inviteItemTemplate(data);
				//alert(html);
				//_$inviteListCol1.append(JSON.stringify(inviteModel.toJSON()));
				/*
				if (i++ % 2 == 0) {
					_$inviteListCol2.append(html);
				} else {
					_$inviteListCol1.append(html);
				}*/
			//});

log('inviteModels 2', that.model.get('inviteCollection').models);
			

		},
		///////////////////////////////////////////////////////////////////////

		setModel: function(m) {
			that.model = m;
			//that.render();
			that.addMap();

			// BINDINGS
			that.model.bind('change:inviteCollection', that.renderInvited);
log('setModel');
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

			_appModel = options.appModel;
			_inviteItemTemplate = _.template(InviteItemTemplate);

			var selectFunction = that.model.addToInvited;
			_friendAutoSuggest = new AutoSuggest(_appModel.get('friendCollection'), C.AutoSuggestType.Friend, selectFunction);
		}

	});

	return EventView;

});