///////////////////////////////////////////////////////////////////////////////
// DAY MODEL
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

	var that,
		_appModel,
		_eventCollection;

	var DayModel = Backbone.Model.extend({
		// ATTRIBUTES:
		// appModel
		// calEvents
		//	a collection of EventModels pulled from the master EventCollection in AppModel
		// dayCode
		// displayDate
		// currEventName

		defaults: {
			appModel: null,
			calEvents: null,
			dayCode: (function() {
				var d = new Date();
				return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).toISOString().split('T')[0];
			})(),
			displayDate: (function() {
				var d = new Date();
				return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).toLocaleDateString();
			})(),
			currEventName: ''
		},

		setSelectedEvent: function(cid) {

			// Day View should really be using a composite model.
			// 1 Day Model + 1 Event Model
			// Figure that out next.
			var selectedEvent = _eventCollection.getByCid(cid);
			//this.set('currEventName', selectedEvent.get('name'));
		},

		checkEventCollectionForNewEvents: function() {
			var evtColl =  _eventCollection.getEventsWithDayCode(that.get('dayCode'))
			that.set('calEvents', evtColl);
			if (evtColl.length > 1) {
				that.trigger('change:calEvents'); 	// Need a manual trigger since it's always an array.
													// Can't detect change.		
			}
			//console.log('events updated in day model', this.get('calEvents'));
		},

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			
			// VARS
			that = this;
			_appModel = options.appModel;
			_eventCollection = _appModel.get('eventCollection');

			// EVENT HANDLERS
			var onDayCodeChange = function() {
				var dayCode = that.get('dayCode');
				var parts = dayCode.split('-');
				that.set('displayDate', new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString());
				that.checkEventCollectionForNewEvents();
			};

			var onEventCollectionAdd = function() {
				that.checkEventCollectionForNewEvents();
			}

			// BINDINGS
			that.bind('change:dayCode', onDayCodeChange);
			_eventCollection.bind('add', onEventCollectionAdd);

		}

	});

	return DayModel;

});