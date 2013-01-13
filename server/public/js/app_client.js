define([
	'jquery',
	'modernizr',
	'underscore',
	'backbone',
	'plugins',
	'bootstrap',

	'models/app_model',
	'c'
], function(
	jQuery,
	Modernizr,
	_,
	Backbone,
	plugins,
	Bootstrap,

	AppModel,
	C
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
			'account/:action': 			'account',
			'account':  				'account',
			'logout':  					'logout',
			'*path':  					'catchall'
		},

		catchall: function() {
log('ROUTE: catchall');
			var route = {
				dest: function() { 
					_appModel.routeCatchall(); 
				},
				pullAccountFirst: true
			};
			_appModel.route(route);
		},

		logout: function() {
			var route = {
				dest: function() {
					_appModel.routeLogout();
				},
				pullAccountFirst: false
			};
			_appModel.route(route);
		},

		day: function(dayCode) {
log('ROUTE: day', dayCode);
			var route = {
				dest: function() { 
					_appModel.routeDay(dayCode);
				},
				pullAccountFirst: true
			}

			_appModel.route(route);				
		},

		account: function(action, linkId) {
log('ROUTE: account', action, linkId);
			var route = {
				dest: function() { 
					_appModel.routeAccount(action, linkId);
				},
				pullAccountFirst: true
			}
			if (action == C.Links.EmailConfirmation || action == C.Links.ResetPassword || action == C.States.Created) {
				route.pullAccountFirst = false;
			}
			_appModel.route(route);	
		},		

		calendar: function() {
log('ROUTE: calendar');
			var route = {
				dest: function() { 
					_appModel.routeCalendar();
				},
				pullAccountFirst: true
			};
			_appModel.route(route);
		},

		oauth: function() {
log('ROUTE: oauth');
			var route = {
				dest: function() { 
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
				pullAccountFirst: false
			};
			_appModel.route(route);
		},

		link: function(linkId) {
log('ROUTE: link', linkId);
			var route = {
				dest: function() { 
					_appModel.routeLink(linkId);
				},
				pullAccountFirst: false
			};
			_appModel.route(route);
		},

		error: function() {
log('ROUTE: error');
			var route = {
				dest: function() { 
					_appModel.routeError();
				},
				pullAccountFirst: false
			};
			_appModel.route(route);
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
				if ($(event.target).data('ignore')) {
					return;
				}

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