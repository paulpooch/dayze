///////////////////////////////////////////////////////////////////////////////
// ACCOUNT VIEW
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',
	
	'c',
	'text!templates/account_template.html',
	'filter',
	'logg'
], function(
	jQuery,
	_,
	Backbone,
	
	C,
	AccountTemplate,
	Filter,
	Log
) {

	var that,
		_appModel,
		_accountModel,
		_$headerEls;

	var AccountView = Backbone.View.extend({

		template: _.template(AccountTemplate),

		render: function() {
			var data = that.model.toJSON();
			that.$el.html(that.template(data));
		},

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
			'change input': 'syncForm',
			'change textarea': 'syncForm',
		},

		syncForm: function(e) {
			var target = $(e.currentTarget);
      		var data = {};
      		data[target.attr('id')] = target.val();
      		that.model.set(data);
		},
		///////////////////////////////////////////////////////////////////////

		// MODEL EVENTS ///////////////////////////////////////////////////////
		onActiveViewChange: function() {
			if (_appModel.get('activeView') == C.ActiveViews.Account) {
				_$headerEls.show();	
			} else {
				_$headerEls.hide();
			}
		},
		///////////////////////////////////////////////////////////////////////

	    initialize: function (options) {
			that = this;
			_.bindAll(that);
	        
	        _appModel = options.appModel;
	        _accountModel = that.model;
	        _$headerEls = $('.account_view_header');

	        // BINDINGS
	        _appModel.bind('change:activeView', that.onActiveViewChange);

	   		that.render();
	    }
	   
	});

	return AccountView;

});
