///////////////////////////////////////////////////////////////////////////////
// CLIENT UTILS
///////////////////////////////////////////////////////////////////////////////
define([
	'jquery',
	'underscore',
	'filter'
], function(
	jQuery,
	_,
	Filter
) {

    var SmartForm = function(model, $formEl, submitFunction, triggerAction) {
    	if (!triggerAction) {
    		triggerAction = 'click';
    	}
		var $triggerEl = $formEl.find('[data-submit-trigger=1]');
		var filterAction = $formEl.data('filter');

		// syncForm
		$formEl.on('change', 'input, textarea', function(e) {
			var target = $(e.currentTarget);
	    	var data = {};
	    	data[target.attr('id')] = target.val();
	    	model.set(data);
		});

		// enter key
		$formEl.on('keypress', 'input', function(e) {
			if (e.which && e.which == 13) {
				$triggerEl.trigger(triggerAction);
	    	}
	  	});

		$triggerEl.on(triggerAction, function() {
			var result = Filter.clean($formEl, filterAction, true);
			var didPass = result.passed;
	  		$formEl.data('filter-passed', didPass);
	  		
	  		if (didPass) {
	  			// Ensure sync
				var $inputs = $formEl.find('input, textarea');
				var data = {};
				$inputs.each(function(index, el) {
					var $el = $(el);
					var id = $el.attr('id');
					data[id] = $el.val();
				});
				model.set(data);
	  			
	  			var loadingText = $triggerEl.data('loading-text');
	  			if (loadingText) {
	  				$triggerEl.text(loadingText);
	  			}
	  			$triggerEl.attr('disabled', true);

	  			submitFunction();
	  		}

	  	});
	};

	return SmartForm;

});