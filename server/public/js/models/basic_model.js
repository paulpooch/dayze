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
			error: null,
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
		onErrorChange: function() {
			var error = that.get('error');
			that.set('header', 'Error');
			that.set('body', error);
		},
		///////////////////////////////////////////////////////////////////////

		initialize: function(options) {
			that = this;
			_.bindAll(that);

			_appModel = options.appModel;

			// BINDINGS
			that.bind('change:error', that.onErrorChange);
		}

	});

	return BasicModel;

});