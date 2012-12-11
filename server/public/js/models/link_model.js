///////////////////////////////////////////////////////////////////////////////
// LINK MODEL
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

	var LinkModel = Backbone.Model.extend({

		urlRoot: '/rest/link',
		idAttribute: 'linkId',

		defaults: {
			linkId: null,
			errors: null,
			type: null
		},

		validate: function(attrs) {
			if (attrs.errors) {
				_appModel.showError(attrs.errors);
				return attrs.errors;
			}
		},

		toJSON: function() {
			return {
				linkId: that.get('linkId')
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

	return LinkModel;

});