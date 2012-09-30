///////////////////////////////////////////////////////////////////////////////
// ACCOUNT VIEW
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',

	'text!templates/account_template.html',
], function(
	jQuery,
	_,
	Backbone,
	
	AccountTemplate
) {

	var _app;

	var AccountView = Backbone.View.extend({

		template: _.template(AccountTemplate),

	    initialize: function (options) {
	    	var options = options || {};
			_app = options.app;
	        _.bindAll(this);
	        this.model.on('change', this.render, this);
	        this.render();
	        //this.model.bind('change:displayName', this.changeDisplayName);

	    },

	    render: function () {
	    	this.$el.html(this.template(this.model.toJSON()));
	    },

	    // changeDisplayName: function () {
	    //     this.$('.display_name').text(this.model.get('displayName'));
	    // }


	});

	return AccountView;

});