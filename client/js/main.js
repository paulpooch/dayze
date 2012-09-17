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

	    var weekEls = [];
		var MONTH_NAMES = [ "January", "February", "March", "April", "May", "June",
			    "July", "August", "September", "October", "November", "December" ];

	    /*
	    var getEl = function() {
		    var elements = {
		    	monthNameTitleBar: '#month_name',
		    	calendar: '#calendar'
		    };
	    	var elCache = {};
	    	return function() {
	    		var elName = arguments.length && arguments[0];
	    		var elId = elements[elName];
				var el = elCache[elName];
		    	if (el) {
					console.log('cache hit');
		    		return el;
		    	}
		    	el = $(elId);
		    	elCache[elName] = el;
		    	console.log('cache miss');
		    	return el;
	    	};
	    }();
	    */

	    var init = function() {
	    	var initialWeekCount = 20;
	        var weekDate = new Date();
	        var day = weekDate.getDay();
	        var diff = weekDate.getDate() - day;
	        weekDate.setDate(diff);
	        for (var i = 0; i < initialWeekCount; i++) {
	            weekDate.setDate(weekDate.getDate() + 7);
	            //console.log(weekDate);
	            displayWeek(weekDate);
	        }

	        $('#calendar').on('click', '.day', function() {
	        	window.location.hash = 'example';
	        });

		    $(window).scroll(function () { 
		      handleScroll();
		    });

			var firstVisibleWeek = weekEls[0].timestamp;
			var currentMonth = MONTH_NAMES[firstVisibleWeek.getMonth()];
			$('#month_name').text(currentMonth);

	    };

	    var handleScroll = function() {
	    	// We can use this caching style if we need to setup the vars at time of first call.
	    	if (!handleScroll.heightOfOneWeek) {
		    	handleScroll.heightOfOneWeek = $('#calendar .day_wrap:eq(0)').height();
		    	handleScroll.weekPlaceHolder = $('#month_name');
			    handleScroll.prevY = $(window).scrollTop();
			};
			var scrollTop = $(window).scrollTop();
		    if (Math.abs(scrollTop - handleScroll.prevY) > handleScroll.heightOfOneWeek / 2) {
				var hiddenWeekCount = Math.ceil(scrollTop / handleScroll.heightOfOneWeek);
			    var firstVisibleWeek = weekEls[hiddenWeekCount].timestamp;
			    var currentMonth = MONTH_NAMES[firstVisibleWeek.getMonth()];
			    handleScroll.prevY = $(window).scrollTop();
			    handleScroll.weekPlaceHolder.text(currentMonth);
			    console.log('update ' + currentMonth);
		    }
	    };

	    var displayWeek = (function(weekDate) {
	    	// We can use this caching style if we can setup vars at load time.
			var template = _.template($("#template_week").html());
			var calendar =  $("#calendar");
	    	var fn = function(weekDate) {
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
		        var el = template(days);
		        weekEls.push({
		        	htmlEl: el,
		        	timestamp: new Date(weekDate)
		        });
		       calendar.append(el);
	    	};
	    	return fn;
	    })();

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
