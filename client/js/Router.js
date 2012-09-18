define(['jquery', 'underscore', 'backbone'], function(jQuery, _, Backbone) {

	var Router = Backbone.Router.extend({

		initialize: function(options) {
			var options = options || {};
			var pushState = options.pushState || 'true';
			this.registerListeners();
		},

		routes: {
			/* TODO: customize */
			"help/:page":         "help",
			"download/*path":     "download",
			"folder/:name":       "openFolder",
			"folder/:name-:mode": "openFolder"
		},

		registerListeners: function() {

			$(document).on('click', 'a:not([data-bypass])', function (event) {

			    var href = $(this).attr('href');
			    var protocol = this.protocol + '//';

			    if (href.slice(protocol.length) !== protocol) {
			      event.preventDefault();
			      app.router.navigate(href, true);
			    }

			});

		}
	});

	return Router;

});