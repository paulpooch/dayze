///////////////////////////////////////////////////////////////////////////////
// APP MODEL
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',

	'models/account_model',
	'models/calendar_model',
], function(
	jQuery,
	_,
	Backbone,

	AccountModel,
	CalendarModel
) {

	var _accountModel,
		_calendarModel;

	var AppModel = Backbone.Model.extend({
		       
	    initialize: function (options) {
	    	var options = options || {};
	    	
	    	_accountModel = new AccountModel();
			_calendarModel = new CalendarModel({ app: options.app });
	    	
	    	this.set('calendarModel', _calendarModel);
	    	this.set('accountModel', _accountModel);

	    	_accountModel.fetch();
	    }
	   
	});

	return AppModel;

});