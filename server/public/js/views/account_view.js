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

	var AccountView = Backbone.View.extend({

		template: _.template(AccountTemplate),

		render: function () {
	    	this.$el.html(this.template(this.model.toJSON()));
	    },

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
			
		},
		///////////////////////////////////////////////////////////////////////

		// MODEL EVENTS ///////////////////////////////////////////////////////

		///////////////////////////////////////////////////////////////////////

	    initialize: function (options) {
	    	var options = options || {};
	        _.bindAll(this);
	        this.model.on('change', this.render, this);
	        this.render();
	    }

	});

	return AccountView;

});