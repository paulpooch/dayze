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

	var _userButton;
	var _userModal;
	var _userEmail;
	var _userPassword;

	var AccountView = Backbone.View.extend({

		template: _.template(AccountTemplate),

		render: function () {
	    	this.$el.html(this.template(this.model.toJSON()));
	    },

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
			'click #user_button': 'toggleModal'
		},
		///////////////////////////////////////////////////////////////////////

		// MODEL EVENTS ///////////////////////////////////////////////////////

		///////////////////////////////////////////////////////////////////////

		toggleModal: function(event) {
			_userModal.modal('toggle');
		},

	    initialize: function (options) {
	    	var options = options || {};
	        _.bindAll(this);
	        this.model.on('change', this.render, this);
	        this.render();

	        // following elements don't exist unti render is called
	        _userButton = this.$el.find('#user_button')
	        _userModal = this.$el.find('#user_modal');
	        _userEmail = this.$el.find('#user_email');
	        _userPassword = this.$el.find('#user_password');

			// bind user button pressed state to modal state
	        _userModal.bind('show', function() {
	        	_userButton.button('toggle');

	        	/* TODO: no idea why i need to wrap this in a timeout */
	        	setTimeout(function(){ _userEmail.focus(); }, 500);

	        }).bind('hide', function() {
	        	_userButton.button('toggle');
	        })
	    }

	});

	return AccountView;

});