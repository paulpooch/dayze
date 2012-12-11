///////////////////////////////////////////////////////////////////////////////
// NOTIFICATION MODEL
///////////////////////////////////////////////////////////////////////////////
define([
	'underscore',
	'backbone'
], function(
	_,
	Backbone
) {

	var that;

	var NotificationModel = Backbone.Model.extend({

		defaults: {
			isSupported: false,
			isAllowed: false,
			isDenied: false,
			icon: '',
			title: '',
			body: '',
			onDisplay: null,
			onClose: null
		},

		initialize: function(options) {
			that = this;
			_.bindAll(that);
		}

	});

	return NotificationModel;

});