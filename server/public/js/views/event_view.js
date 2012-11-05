///////////////////////////////////////////////////////////////////////////////
// EVENT VIEW
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',
	'google',

	'text!templates/event_template.html',
], function(
	jQuery,
	_,
	Backbone,
	Google,

	EventTemplate
) {

	var that,
		_appModel;

	/* Try a standalone one to isolate variables 
	var Map = (function() {

		var Map = {},
			gmap,
			isGmapsLoaded = false;

		var onGmapsLoaded = function() {
			console.log(3);
			isGmapsLoaded = true;
			console.log(4);
			Map.init();
		};

		Map.init = function() {
			if (!isGmapsLoaded) {
				// Load the map scripts
				google.load('maps', '3', { other_params: 'sensor=true' });
				console.log(1);
				google.setOnLoadCallback(onGmapsLoaded);
				console.log(2);
			} else {
				var options = {
					zoom: 0,
					center: new google.maps.LatLng(0, 0),
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};
				gmap = new google.maps.Map(document.getElementById('event_map'), options);
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(currPosCallback);
				} else {
					alert('The browser does not support geolocation');
				}
			}
		};

		var currPosCallback = function(pos) {
			var userLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			var marker = new google.maps.Marker({
				position: userLatLng,
				map: gmap
			});
			gmap.setCenter(userLatLng);
			gmap.setZoom(15);
		};

		return Map;

	})();
	*/

	var EventView = Backbone.View.extend({

		template: _.template(EventTemplate),

		render: function() {
			this.$el.html(that.template(that.model.toJSON()));
		},

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
			'change input': 'syncForm',
			'change textarea': 'syncForm',
			'change #location': 'mapLocation',
			'click #location_button': 'mapLocation'
		},

		syncForm: function(e) {
			var target = $(e.currentTarget);
      		var data = {};
      		data[target.attr('id')] = target.val();
      		this.model.set(data);
		},

		mapLocation: function() {

			var mapCanvas = $('#event_map').get(0);
			Google.addMapToCanvas(mapCanvas);

			//console.log(google);
			//var loc = $('#location').val();
			//Map.init();
		},
		///////////////////////////////////////////////////////////////////////

		// MODEL EVENTS ///////////////////////////////////////////////////////
		update: function() {
			
			that.render();
		},
		///////////////////////////////////////////////////////////////////////

		setModel: function(m) {
			that.model = m;
			that.update();
		},

		setElAndRender: function(el) {
			that.$el = el;
			that.delegateEvents(); // Must occur whenever we change $el or 'events' won't work.
			that.update();
		},

		initialize: function(options) {
			_.bindAll(this);
			that = this;
			_appModel = options.appModel;
			
			// BINDINGS
			that.update();
		}

	});

	return EventView;

});