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

		defaults: {
			appModel: null,
			todaysEvents: null,
			dayCode: (function() {
				var d = new Date();
				return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).toISOString().split('T')[0];
			})(),
			displayDate: (function() {
				var d = new Date();
				return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).toLocaleDateString();
			})(),
			selectedEventId: null,
			isActiveView: false
		},

		checkEventCollectionForNewEvents: function() {
			var evtColl =  _eventCollection.getEventsWithDayCode(that.get('dayCode'));
			that.set('todaysEvents', evtColl);
			if (evtColl.length > 1) {
				that.trigger('change:todaysEvents');	// Need a manual trigger since it's always an array.
														// Can't detect change.
			}
		},

		// EVENTS /////////////////////////////////////////////////////////////
		onEventCollectionAdd: function() {
			that.checkEventCollectionForNewEvents();
		},

		onDayCodeChange: function() {
			var dayCode = that.get('dayCode');
			var parts = dayCode.split('-');
			that.set('displayDate', new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString());
			that.checkEventCollectionForNewEvents();
		},
		///////////////////////////////////////////////////////////////////////

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			
			// VARS
			that = this;
			_appModel = options.appModel;
			_eventCollection = _appModel.get('eventCollection');

			// BINDINGS
			that.bind('change:dayCode', that.onDayCodeChange);
			_eventCollection.bind('add', that.onEventCollectionAdd);

		}

	});

	return DayModel;

});