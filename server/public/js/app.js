define([
	'jquery',
	'modernizr',
	'underscore',
	'backbone',
	'plugins',
	'bootstrap',

	'collections/user_collection',
	
	'models/google_o_auth_model',
	'models/user_model',
	'models/calendar_model',
	'models/account_model',

	'views/user_view',
	'views/calendar_view',
	'views/account_view',
	
	'router'
], function(
	jQuery,
	Modernizr,
	_,
	Backbone,
	plugins,
	Bootstrap,

	UserCollection,
	
	GoogleOAuthModel,
	UserModel,
	CalendarModel,
	AccountModel,
	
	UserView,
	CalendarView,
	AccountView,
	
	Router
) {

	var App = function() {

		var _router;
		var _userModel, _calendarModel, _accountModel;
		var _userView, _calendarView, _accountView;

		var _$header;
		var _$container;

		var _initialize = function() {

			// customize sync function
			Backbone.sync = _sync;

			var that = this;
			$(function() { _domReady.call(that); });
		};

		var _domReady = function() {
			_$header = $('header');
			_$container = $('#container');

			// router
			//_router = new Router({ app: this });

			// models
			//_userModel = new UserModel({ app: this, displayName: 'Anonymous' });
			_calendarModel = new CalendarModel({ app: this });
			_accountModel = new AccountModel();
			
			// views
			//_userView = new UserView({ app: this, model: _userModel, el: _$container.get() });
			_calendarView = new CalendarView({ app: this, model: _calendarModel, el: _$container.get() });
			_accountView = new AccountView({ app: this, model: _accountModel, el: $('#user_controls') });

			// start
			//Backbone.history.start({ 'pushState': true });
			_calendarView.render();
			_accountModel.fetch()
		};

		var _sync = function(method, model, options) {

			var methodMap = {
				'create': 'POST',
				'update': 'PUT',
				'delete': 'DELETE',
				'read':   'GET'
			};

		};

		// expose public methods
		return {
			initialize: _initialize
		};
	};

	return App;

});
