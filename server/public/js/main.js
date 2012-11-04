///////////////////////////////////////////////////////////////////////////////
// MAIN
///////////////////////////////////////////////////////////////////////////////

// http://andyet.net/blog/2010/oct/29/building-a-single-page-app-with-backbonejs-undersc/
// http://sorensen.github.com/aebleskiver/docs/user.model.html

require.config({
	// The shim config allows us to configure dependencies for
	// scripts that do not call define() to register a module
	shim: {
		'underscore': {
			exports: '_'
		},
		'backbone': {
			deps: [
				'underscore',
				'jquery'
			],
			exports: 'Backbone'
		},
		'bootstrap': {
			deps: [
				'jquery'
			]
		},
		'plugins': {
			deps: [
				'jquery'
			]
		}
	},
	paths: {
		jquery: 'vendor/jquery/jquery.min',
		underscore: 'vendor/underscore/underscore',
		backbone: 'vendor/backbone/backbone',
		text: 'vendor/require/text',
		modernizr: 'vendor/modernizr/modernizr',
		bootstrap: 'vendor/bootstrap/bootstrap',
		google: 'vendor/google/google',
		gmaps: 'vendor/google/gmaps',
		plugins: 'plugins'
	}
});

require(['app_client'], function(App) {

	window.Dayze = new App();
	
});
