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
			type: null
		},

		validate: function(attrs) {

		},

		toJSON: function() {
			return {
				linkId: that.get('linkId'),
				type: that.get('type')
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