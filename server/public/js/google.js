// http://experiencecraftsmanship.wordpress.com/2012/01/22/google-maps-hello-world-with-requirejs-and-jquery/
define([
	'jqueryui',
	'async!http://maps.google.com/maps/api/js?key=AIzaSyDIc1qNTUvLvybuC4-dGGq6zWT0FMaJpYA&sensor=true!callback'
], function(
) {

	var Google = {};

	Google.Maps = (function($) {
		
		var Maps = {};
		var _map,
			_geocoder,
			_marker;

		Maps.addMapToCanvas = function(mapCanvas) {
			var myOptions = {
				center: new google.maps.LatLng(40.7142, -74.0064),
				zoom: 10,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};

			_map = new google.maps.Map(mapCanvas, myOptions);
			_geocoder = new google.maps.Geocoder();
			_marker = new google.maps.Marker({
    			map: _map,
    			draggable: true,
    			animation: google.maps.Animation.DROP,
    			rotate: 0
    		});
		};

		Maps.setupGeocodeAutocomplete = function(inputEl) {
			inputEl.autocomplete({
				source: function(request, response) {
					_geocoder.geocode(
						{ 'address': request.term },
						function(results, status) {
							response(
								$.map(
									results, 
									function(item) {
			            				return {
			              					label: item.formatted_address,
			              					value: item.formatted_address,
			             					latitude: item.geometry.location.lat(),
			              					longitude: item.geometry.location.lng()
			            				}
			            			}
			            		)
			            	);
		            	}
		            );
        		},
      			select: function(event, ui) {
        			$('#latitude').val(ui.item.latitude);
        			$('#longitude').val(ui.item.longitude);
        			var location = new google.maps.LatLng(ui.item.latitude, ui.item.longitude);
        			_marker.setPosition(location);
        			_map.setCenter(location);
        		}
        	});
		};

		return Maps;

	})(jQuery);

	return Google;

});