///////////////////////////////////////////////////////////////////////////////
// APP CLIENT
///////////////////////////////////////////////////////////////////////////////

// DEVELOPMENT RULES
// 1. ALWAYS USE 'that'.  NEVER 'this'.
// 2. EXPLICITY DECLARE ALL ATTRIBUTES IN MODEL defaults.

define([
	'jquery',
	'modernizr',
	'underscore',
	'backbone',
	'plugins',
	'bootstrap',

	'router',
	
	'models/app_model'
], function(
	jQuery,
	Modernizr,
	_,
	Backbone,
	plugins,
	Bootstrap,

	Router,

	AppModel
) {

	var _router, 
		_appModel;

	var App = function() {

		var _initialize = function() {
			// customize sync function
			//Backbone.sync = _sync;
			var that = this;
			$(function() { _domReady.call(that); });
		};

		var _domReady = function() {
			_appModel = new AppModel({ app: this });
			_router = new Router({ app: this });
		};

		/*
		var _sync = function(method, model, options) {

			console.log(method);

			var methodMap = {
				'create': 'POST',
				'update': 'PUT',
				'delete': 'DELETE',
				'read':   'GET'
			};

		};
		*/

		// Expose public methods.
		return {
			initialize: _initialize,
			oauth2Callback: _oauth2Callback
		};
	};

	var _oauth2Callback = function() {
		_appModel.oauth2Callback();
	}

	return App;

});
