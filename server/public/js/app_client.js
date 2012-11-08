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
			'day/:dayCode':		'day',
			'calendar':			'calendar',
			'create_account':	'createAccount',
			'oauth': 			'oauth', 
		},

		day: function(dayCode) {
			log('ROUTE: day/', dayCode);
		},

		calendar: function() {
			log('ROUTE: calendar');
			_appModel.routeCalendar();
		},

		createAccount: function() {
			log('ROUTE: create_account');
			_appModel.routeCreateAccount();
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
		}


		/*
		initialize: function() {
			that = this;
			
			var options = options || {};
			var pushState = options.pushState || 'true';
			_appModel = new AppModel({ router: that });
			Backbone.history.start({ pushState: pushState });
			$(function() { that.domReady.call(that); });
		},

		domReady: function() {
			console.log('domReady');
			that.registerListeners.call(that);
			//that.navigate('calendar');
		},

		routes: {
			oauth2callback: 'oauth2Callback', 
			settings: 		'settings',
			create_account: 'create_account',
			calendar:  		'calendar',
			day: 			'day/:dayCode'	
		},

		oauth2Callback: function() {
			log('ROUTE: oauth2Callback');
			_appModel.oauth2Callback();
		},

		settings: function() {
			log('ROUTE: settings');
		},

		create_account: function() {
			log('ROUTE: create_account');
			_appModel.createAccount();
		},

		calendar: function() {
			log('ROUTE: calendar');
		},

		day: function(dayCode) {
			log('ROUTE: day/', dayCode);
		},

		registerListeners: function() {
			$(document).on('click', 'a:not([data-bypass])', function (event) {

				// intercept all 'a' clicks
				// if 'href' contains 'http://', let event leak
				// if 'href' contains '#!', use pushstate
				// if 'href' contains '#', do nothing

			    var href = $(that).attr('href');
			    var protocol = that.protocol + '//';

			    if (href.slice(protocol.length) !== protocol) {
					event.preventDefault();
					if (href.length > 2 && href.slice(0, 2) === '#!') {
						that.navigate(href.slice(2), true);
			    	}
			    }
			});

		},
		*/

	});

	return App;

});