define([
	'jquery',
	'modernizr',
	'underscore',
	'backbone',
	'plugins',
	'bootstrap',

	'models/app_model'
], function(
	jQuery,
	Modernizr,
	_,
	Backbone,
	plugins,
	Bootstrap,

	AppModel
) {

	var _appModel;

	var App = Backbone.Router.extend({

		initialize: function() {
			var that = this;
			var options = options || {};
			var pushState = options.pushState || 'true';
			_appModel = new AppModel({ app: this });
			Backbone.history.start({ pushState: pushState });
			$(function() { that.domReady.call(that); });
		},

		domReady: function() {
			this.registerListeners.call(this);
		},

		routes: {
			oauth2callback: 		'oauth2Callback', 
			settings: 				'settings', 
		},

		registerListeners: function() {
			var that = this;

			$(document).on('click', 'a:not([data-bypass])', function (event) {

				// intercept all 'a' clicks
				// if 'href' contains 'http://', let event leak
				// if 'href' contains '#!', use pushstate
				// if 'href' contains '#', do nothing

			    var href = $(this).attr('href');
			    var protocol = this.protocol + '//';

			    if (href.slice(protocol.length) !== protocol) {
					event.preventDefault();
					if (href.length > 2 && href.slice(0, 2) === '#!') {
						that.navigate(href.slice(2), true);
			    	}
			    }
			});

		},

		oauth2Callback: function() {
			_appModel.oauth2Callback();
		},

		settings: function() {
			alert('settings!');
		}

	});

	return App;

});