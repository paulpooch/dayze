define(['jquery', 'underscore', 'backbone'], function(jQuery, _, Backbone) {

	var _app;

	var Router = Backbone.Router.extend({

		initialize: function(options) {
			var options = options || {};
			var pushState = options.pushState || 'true';
			_app = options.app;
			Backbone.history.start({ pushState: pushState });
			this.registerListeners();
		},

		routes: {
			/* TODO: customize */
			"help/:page":         "help",
			"download/*path":     "download",
			"folder/:name":       "openFolder",
			"folder/:name-:mode": "openFolder",
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
			_app.oauth2Callback();
		},

		settings: function() {
			alert('settings!');
		}

	});

	return Router;

});