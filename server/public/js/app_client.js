///////////////////////////////////////////////////////////////////////////////
// APP CLIENT
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'modernizr',
	'underscore',
	'backbone',
	'plugins',
	'bootstrap',

	'router',
	
	'models/app_model',
	'views/app_view'
], function(
	jQuery,
	Modernizr,
	_,
	Backbone,
	plugins,
	Bootstrap,

	Router,

	AppModel,
	AppView
) {

	var App = function() {

		var _router, 
			_appModel,
			_appView;

		var _initialize = function() {

			// customize sync function
			Backbone.sync = _sync;

			var that = this;
			$(function() { _domReady.call(that); });
		};

		var _domReady = function() {
			_$header = $('header');

			_appModel = new AppModel({ app: this });
			_appView = new AppView({ model: _appModel });
		};

		var _sync = function(method, model, options) {

			var methodMap = {
				'create': 'POST',
				'update': 'PUT',
				'delete': 'DELETE',
				'read':   'GET'
			};

		};

		// Expose public methods.
		return {
			initialize: _initialize
		};
	};

	return App;

});
