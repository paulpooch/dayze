define([
	'jquery',
	'underscore',
	'backbone'
], function(
	jQuery,
	_,
	Backbone
) {

	var _app;

	var AccountView = Backbone.View.extend({

	    initialize: function (options) {
	    	var options = options || {};
			_app = options.app;

	        _.bindAll(this);
	        this.model.bind('change:displayName', this.changeDisplayName);
	    },

	    render: function () {
	        // "ich" is ICanHaz.js magic
	        //this.el = ich.user(this.model.toJSON());
	        return this;
	    },

	    changeDisplayName: function () {
	        this.$('.display_name').text(this.model.get('displayName'));
	    }


	});

	return AccountView;

});