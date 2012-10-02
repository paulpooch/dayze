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

	var DayModel = Backbone.Model.extend({

		defaults: {
			appModel: null,
			events: null,
			dayCode: (function() {
				var d = new Date();
				return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).toISOString().split('T')[0];
			})(),
			displayDate: ''
		},

		initialize: function() {
			console.log('day model created.');
			this.bind('change:dayCode', function() {
				var dayCode = this.get('dayCode');
				var parts = dayCode.split('-');
				this.set('displayDate', new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString());
				console.log('DayModel dayCode change');
			});
		}

	});

	return DayModel;

});