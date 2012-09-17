define(['jquery', 'underscore', 'backbone'], function(jQuery, _, Backbone) {

	var Router = Backbone.Router.extend({

		defaults: function() {
			return {
				pushState: true
			};
		},

		initialize: function(options) {
			option = options || {};
			this.set('pushState', options.pushState || this.get('pushState'));

			Backbone.history.start({ pushState: this.get('pushState') });
			this.registerListeners();
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

	return Router;

});