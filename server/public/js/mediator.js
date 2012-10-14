define(['jquery', 'underscore', 'backbone'], function(jQuery, _, Backbone) {

	var Mediator = {};

	var _appView,
		_appModel,
		_eventView;

	// SETTERS ////////////////////////////////////////////////////////////

	Mediator.setAppView = function(a) {
		_appView = a;
	};

	Mediator.setAppModel = function(a) {
		_appModel = a;
	};

	Mediator.setEventView = function(a) {
		_eventView = a;
	}

	///////////////////////////////////////////////////////////////////////

	Mediator.setSelectedEvent = function(selectedEventModel) {
		_eventView.setModel(selectedEventModel);
	};

	Mediator.renderEventView = function(dayViewEl) {
		var eventViewEl = dayViewEl.find('#event_view_holder');
		_eventView.setElAndRender(eventViewEl);
	};

	return Mediator;

});
