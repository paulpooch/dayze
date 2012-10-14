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
	'mediator',
	
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
	Mediator,

	AppModel,
	AppView
) {

	var App = function() {

		var _router,
			_mediator, 
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

			_router = new Router();
			_mediator = Mediator;

			_appModel = new AppModel({ app: this, mediator: _mediator });
			_appView = new AppView({ model: _appModel, el: $('body'), mediator: _mediator });
			_mediator.setAppModel(_appModel);
			_mediator.setAppView(_appView);
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
