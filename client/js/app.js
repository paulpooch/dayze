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

	var _router;
	var _userModel, _calendarModel;
	var _userView, _calendarView;

	var _$header;
	var _$container;

	var _getHeader = function() {
		return _$header;
	};

	var _getContainer = function() {
		return _$container;
	};

	var App = function() {

		var _initialize = function() {
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

		// expose public methods
		return {
			initialize: _initialize,
			getHeader: _getHeader,
			getContainer: _getContainer
		};
	};

	return App;

});
