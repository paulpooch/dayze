// http://experiencecraftsmanship.wordpress.com/2012/01/22/google-maps-hello-world-with-requirejs-and-jquery/
define([
	'c'
], function(
	C
) {

	var Facebook = function() {

		var ready = false;

		var login = function() {
			if (ready) {
				FB.login(function(response) {
					console.log(response);
				});
			}
		};

		var logout = function() {
			FB.logout(function(response) {
				console.log(response);
			});
		}

		window.fbAsyncInit = function() {
		    // init the FB JS SDK
			FB.init({
				appId      : '576982815664713', // App ID from the App Dashboard
				channelUrl : C.Domain + '/channel.html', // Channel File for x-domain communication
				status     : true, // check the login status upon init?
				cookie     : true, // set sessions cookies to allow your server to access the session?
				xfbml      : true  // parse XFBML tags on this page?
			});

			ready = true;

		};

		(function(d, debug) {
		var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
		if ( d.getElementById(id) ) { return; }
		js = d.createElement('script'); js.id = id; js.async = true;
		js.src = "//connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
		ref.parentNode.insertBefore(js, ref);
		} (document, /*debug*/ false) );

		return {
			login: login
		};

	};

	return Facebook;

});