///////////////////////////////////////////////////////////////////////////////
// BASIC MODEL
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

	var BasicModel = Backbone.Model.extend({

		defaults: {
			header: '',
			subheader: '',
			body: ''
		},

		toJSON: function() {
			return {
				header: that.get('header'),
				subheader: that.get('subheader'),
				body: that.get('body')
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

	return BasicModel;

});