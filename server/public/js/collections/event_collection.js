define([
	'jquery',
	'underscore',
	'backbone',

	'models/event_model'
], function(
	jQuery,
	_,
	Backbone,
	
	EventModel
) {

	var EventCollection = Backbone.Collection.extend({
	
		model: EventModel,
		url: '/event',

		initialize: function() {
			//this.fetch();
		}

	});

	// Notice we're instantiating here.
	return EventCollection;

});