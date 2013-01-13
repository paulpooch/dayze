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
		_appModel;

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
			isActiveView: false,
			addEventText: null
		},

		toJSON: function() {
			return {
				todaysEvents: that.get('todaysEvents'),
				selectedEventId: that.get('selectedEventId'),
				dayCode: that.get('dayCode')
			};
		},

		// EVENTS /////////////////////////////////////////////////////////////
		onDayCodeChange: function() {
			var dayCode = that.get('dayCode');
			var parts = dayCode.split('-');
			that.set('displayDate', new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString());
		},
		///////////////////////////////////////////////////////////////////////

		initialize: function(options) {
			// This is really important.
			// Binds all event callbacks to 'this'.
			_.bindAll(this);
			
			// VARS
			that = this;
			_appModel = options.appModel;
		}

	});

	return DayModel;

});