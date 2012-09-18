define(['jquery', 'underscore', 'backbone'], function(jQuery, _, Backbone) {

	var UserView = Backbone.View.extend({

	    initialize: function (args) {
	        _.bindAll(this, 'changeDisplayName');
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

	return UserView;

});