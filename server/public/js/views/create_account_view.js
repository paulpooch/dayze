///////////////////////////////////////////////////////////////////////////////
// CREATE ACCOUNT
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',

	'c',
	'text!templates/page_create_account.html',
], function(
	jQuery,
	_,
	Backbone,
	
	C,
	CreateAccountPage
) {

	var that,
		_appModel,
		_$headerEls;

	var CreateAccountView = Backbone.View.extend({

		template: _.template(CreateAccountPage),

		render: function () {
			var data = that.model.toJSON();
			that.$el.html(that.template(data));
		},

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
		},
		///////////////////////////////////////////////////////////////////////

		// MODEL EVENTS ///////////////////////////////////////////////////////
		onActiveViewChange: function() {
			if (_appModel.get('activeView') == C.ActiveViews.CreateAccount) {
				_$headerEls.show();	
			} else {
				_$headerEls.hide();
			}
		},
		///////////////////////////////////////////////////////////////////////

		initialize: function (options) {
	    	_.bindAll(this);
			that = this;
			
			_appModel = options.appModel;
	    	_$headerEls = $('.create_account_view_header');
	    	
	        // BINDINGS
	      	_appModel.on('change:activeView', that.onActiveViewChange);

	      	this.render();
	    },

	});

	return CreateAccountView;

});