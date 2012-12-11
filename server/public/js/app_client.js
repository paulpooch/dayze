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

	var that,
		_appModel;

	var App = Backbone.Router.extend({

		routes: {
			'day/:dayCode':				'day',
			'calendar':					'calendar',
			'oauth': 					'oauth',
			'link/:linkId': 			'link',
			'error': 					'error',
			'account/:action/:linkId': 	'account',
			'account/:action': 			'account'
		},

		day: function(dayCode) {
log('ROUTE: day/', dayCode);
			_appModel.routeDay(dayCode);
		},

		calendar: function() {
log('ROUTE: calendar');
			_appModel.routeCalendar();
		},

		oauth: function() {
			// parse hash parameters
			var response = {};
			var queryString = location.hash.substring(1);
    		var regex = /([^&=]+)=([^&]*)/g, m;
			while (m = regex.exec(queryString)) {
			  response[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
			}
			// clear hash
			location.hash = '';
			window.history.replaceState(null, null, '/');

			_appModel.routeOAuth(response);

		},

		link: function(linkId) {
log('ROUTE: link');
			_appModel.routeLink(linkId);
		},

		error: function() {
log('ROUTE: error');
			_appModel.routeError();
		},

		account: function(action, linkId) {
log('ROUTE: account', action, linkId);			
			_appModel.routeAccount(action, linkId);
		},
		
		initialize: function(options) {
			that = this;
			
			_appModel = new AppModel({ router: that });
			var pushState = (options && options.pushState) || 'true';
			// Check for hash tag changes.
			Backbone.history.start({ pushState: pushState });
			that.overrideATags();
		},

		overrideATags: function() {
			$(document).on('click', 'a:not([data-bypass])', function (event) {
				// intercept all 'a' clicks

				var href= $(this).attr('href');
				// if 'href' contains 'http://', let event leak
				if (href.indexOf('://') == -1) {

					that.navigate(href, { trigger: true });

					event.preventDefault();
    				event.stopPropagation();
				}
			});
		},

	});

	return App;

});