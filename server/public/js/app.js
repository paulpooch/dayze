define([
	'jquery',
	'modernizr',
	'underscore',
	'backbone',
	'plugins',
	'models/google_o_auth_model',
	'models/user_model',
	'views/user_view',
	'models/calendar_model',
	'views/calendar_view',
	'router'
], function(jQuery, Modernizr, _, Backbone, plugins, GoogleOAuthModel, UserModel, UserView, CalendarModel, CalendarView, Router) {

	var App = function() {

		var _router;
		var _userModel, _calendarModel;
		var _userView, _calendarView;

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
			_router = new Router({ app: this });
			// models
			_userModel = new UserModel({ app: this, displayName: 'Anonymous' });
			_calendarModel = new CalendarModel({ app: this });

			// views
			_userView = new UserView({ app: this, model: _userModel, el: _$container.get() });
			_calendarView = new CalendarView({ app: this, model: _calendarModel, el: _$container.get() });

			// start
			Backbone.history.start({ 'pushState': true });
			_calendarView.render();
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
