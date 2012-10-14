///////////////////////////////////////////////////////////////////////////////
// USER MODEL
///////////////////////////////////////////////////////////////////////////////
define(['jquery', 'underscore', 'backbone'], function(jQuery, _, Backbone) {

	var that;

	var UserModel = Backbone.Model.extend({

		initialize: function (options) {
			_.bindAll(this);
			that = this;
		}

	});

	return UserModel;

});