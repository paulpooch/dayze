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
			'click #user_button': 'toggleModal',
			'click #google_button': 'googleSignIn'
		},
		///////////////////////////////////////////////////////////////////////

		// MODEL EVENTS ///////////////////////////////////////////////////////

		///////////////////////////////////////////////////////////////////////

		toggleModal: function(event) {
			_userModal.modal('toggle');
		},

		oauth2Callback: function() {
			var that = this;

			this.toggleModal();

			// parse response hash
			var params = {};
			var queryString = location.hash.substring(1);
    		var regex = /([^&=]+)=([^&]*)/g, m;
			while (m = regex.exec(queryString)) {
			  params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
			}

			$.ajax({
	  			url:  'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + params.access_token,
				success: function(data) {
				    that.model.set('displayName', data.name);
				}
			});

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
	    },

	    googleSignIn: function() {
			// https://developers.google.com/accounts/docs/OAuth2Login

			var endpoint = 'https://accounts.google.com/o/oauth2/auth';
			var params = {
				client_id: '495360231026.apps.googleusercontent.com',
				response_type: 'token',
				redirect_uri: 'http://localhost:8000/oauth2callback',
				scope: 'https://www.googleapis.com/auth/userinfo.profile',
				state: ''
			};

			window.location = endpoint + '?' + $.param(params);
		}

	});

	return AccountView;

});