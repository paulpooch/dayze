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

	var App = function() {

		var _router, 
			_appModel;

		var _initialize = function() {
			// customize sync function
			//Backbone.sync = _sync;
			var that = this;
			$(function() { _domReady.call(that); });
		};

		var _domReady = function() {
			_router = new Router();
			_appModel = new AppModel({ app: this });
		};

		var _sync = function(method, model, options) {

			console.log(method);

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
