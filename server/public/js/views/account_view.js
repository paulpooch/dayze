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
	'logg',
	'smart_form'
], function(
	jQuery,
	_,
	Backbone,
	
	C,
	AccountTemplate,
	Filter,
	Log,
	SmartForm
) {

	var that,
		_appModel,
		_accountModel,
		_$accountForm,
		_accountForm,
		_$headerEls;

	var AccountView = Backbone.View.extend({

		template: _.template(AccountTemplate),

		render: function() {
			var data = that.model.toJSON();
			that.$el.html(that.template(data));
			_$accountForm = that.$el.find('#account_form');
			_accountForm = new SmartForm(that.model, _$accountForm, _appModel.editAccount);
			//that.model.set('message', '');
		},

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
			'change input': 'syncForm',
			'change textarea': 'syncForm',
			'click create_password_button': 'onCreatePasswordButtonClick'
		},

		syncForm: function(e) {
			var target = $(e.currentTarget);
      		var data = {};
      		data[target.attr('id')] = target.val();
      		that.model.set(data);
		},

		onCreatePasswordButtonClick: function() {
			
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
