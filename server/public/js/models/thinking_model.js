///////////////////////////////////////////////////////////////////////////////
// THINKING MODEL
///////////////////////////////////////////////////////////////////////////////
define([
	'underscore',
	'backbone'
], function(
	_,
	Backbone
) {

	var that,
		_appModel;

	var ThinkingModel = Backbone.Model.extend({

		defaults: {
			message: 'Thinking...'
		},

		toJSON: function() {
			return {
				message: that.get('message')
			};
		},

		// EVENTS /////////////////////////////////////////////////////////////

		///////////////////////////////////////////////////////////////////////

		initialize: function(options) {
			that = this;
			_.bindAll(that);
			_appModel = options.appModel;
		}

	});

	return ThinkingModel;

});