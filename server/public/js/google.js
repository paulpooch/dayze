define(
	[ "async!http://maps.google.com/maps/api/js?key=AIzaSyDIc1qNTUvLvybuC4-dGGq6zWT0FMaJpYA&sensor=true!callback" ],
	function() {
		return {
			addMapToCanvas: function( mapCanvas ) {
				var myOptions = {
					center: new google.maps.LatLng( -34.397, 150.644 ),
					zoom: 8,
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};

				var map = new google.maps.Map( mapCanvas, myOptions );			
			}		
		}
	}
);