///////////////////////////////////////////////////////////////////////////////
// THINKING VIEW
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'backbone',

	'c',
	'text!templates/thinking_template.html'
], function(
	jQuery,
	_,
	Backbone,

	C,
	ThinkingTemplate
) {

	var that,
		_appModel,
		_$headerEls;
	
	var ThinkingView = Backbone.View.extend({

		template: _.template(ThinkingTemplate),

		render: function () {
			var data = that.model.toJSON();
			that.$el.html(that.template(data));
		},

		// VIEW EVENTS ////////////////////////////////////////////////////////
		events: {
		},
		///////////////////////////////////////////////////////////////////////

		// MODEL EVENTS ///////////////////////////////////////////////////////
		onActiveViewChange: function() {
			if (_appModel.get('activeView') == C.ActiveViews.Basic) {
				_$headerEls.show();	
			} else {
				_$headerEls.hide();
			}
		},
		///////////////////////////////////////////////////////////////////////

		initialize: function (options) {
	    	_.bindAll(this);
			that = this;
			
			_appModel = options.appModel;
	    	_$headerEls = $('.thinking_view_header');
	    	
	        // MODEL EVENTS
	      	_appModel.on('change:activeView', that.onActiveViewChange);
	    }

	});

	return ThinkingView;

});