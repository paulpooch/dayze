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
			calEvents: null,
			dayCode: (function() {
				var d = new Date();
				return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).toISOString().split('T')[0];
			})(),
			displayDate: ''
		},

		checkEventCollectionForNewEvents: function() {
			this.set('calEvents', _eventCollection.getEventsWithDayCode(this.get('dayCode')));
			console.log('events updated in day model', this.get('calEvents'));
		},

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			that = this;

			_appModel = options.appModel;

			this.bind('change:dayCode', function() {
				var dayCode = this.get('dayCode');
				var parts = dayCode.split('-');
				this.set('displayDate', new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString());
				console.log('DayModel dayCode change');
			});

			_eventCollection = _appModel.get('eventCollection');
			_eventCollection.bind('add', function() {
				that.checkEventCollectionForNewEvents();
			});

		}

	});

	return DayModel;

});