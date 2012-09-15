// http://andyet.net/blog/2010/oct/29/building-a-single-page-app-with-backbonejs-undersc/
// http://sorensen.github.com/aebleskiver/docs/user.model.html

// Require.js allows us to configure shortcut alias
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
		}
	},
	paths: {
		jquery: 'vendor/jquery/jquery.min',
		underscore: 'vendor/underscore/underscore',
		backbone: 'vendor/backbone/backbone',
		text: 'vendor/require/text',
		modernizr: 'vendor/modernizr/modernizr',
		plugins: 'plugins'
	}
});

require([
	'jquery',
	'modernizr',
	'underscore',
	'backbone',
	'plugins'
], function(jQuery, Modernizr, _, Backbone) {


	window.Dayze = (function($) {


	    var WEEK_COUNT = 20;
	    var init = function() {

	        var weekDate = new Date();
	        var day = weekDate.getDay();
	        var diff = weekDate.getDate() - day;
	        weekDate.setDate(diff);
	        for (var i = 0; i < WEEK_COUNT; i++) {
	            weekDate.setDate(weekDate.getDate() + 7);
	            //console.log(weekDate);
	            displayWeek(weekDate);
	        }

	    };

	    var displayWeek = function(weekDate) {

	        var weekDateCopy = new Date(weekDate);

	        var days = {};
	        days['d0'] = weekDateCopy.getDate();
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d1'] = weekDateCopy.getDate();
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d2'] = weekDateCopy.getDate();
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d3'] = weekDateCopy.getDate();
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d4'] = weekDateCopy.getDate();
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d5'] = weekDateCopy.getDate();
	        weekDateCopy.setDate(weekDateCopy.getDate() + 1);
	        days['d6'] = weekDateCopy.getDate();

	        var template = _.template($("#template_week").html());
	        var templateData = days;
	        $("#calendar").append(template(templateData));

	    };

	   

	    var User = Backbone.Model.extend({
	       
	        initialize: function (spec) {
	            
	            if (!spec || !spec.displayName) {
	                throw "InvalidConstructArgs";
	            }

	            // we may also want to store something else as an attribute
	            // for example a unique ID we can use in the HTML to identify this
	            // item's element. We can use the models 'cid' or 'client id for this'.
	            this.set({
	                htmlId: 'user_' + this.cid
	            })
	        },
	       
	        validate: function (attrs) {
	            if (attrs.displayName) {
	                if (!_.isString(attrs.displayName) || attrs.displayName.length === 0) {
	                    return "displayName must be a string with a length";
	                }
	            }
	        }

	    });
	    
	    var user = new User({ displayName: 'Anonymous' });

	    var UserView = Backbone.View.extend({

	        initialize: function (args) {
	            _.bindAll(this, 'changeDisplayName');
	            this.model.bind('change:displayName', this.changeDisplayName);
	        },

	        render: function () {
	            // "ich" is ICanHaz.js magic
	            //this.el = ich.user(this.model.toJSON());
	            return this;
	        },

	        changeDisplayName: function () {
	            this.$('.display_name').text(this.model.get('displayName'));
	        }


	    });


	    $(function() {
	        init();
	    });


	})(window.jQuery);

});
