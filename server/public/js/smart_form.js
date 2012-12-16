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
    	
    	this.hotFields = {};
    	this.$formEl = $formEl;
    	this.model = model;

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

	  	this.initHotFields();

	};

	// http://vitalets.github.com/x-editable/
	SmartForm.prototype.initHotFields = function() {

		var hotFields = this.hotFields;
		$formEl = this.$formEl;
		var model = this.model;

		var init = function() {
			var $triggers = $formEl.find('button[data-edits]');
			$triggers.each(function(index, el) {
				var $trigger = $formEl.find(el);
				var fieldName = $trigger.data('edits');
				var $fieldEl = $formEl.find('#' + fieldName);
				var editableType = $trigger.data('editable-type') || 'text';
				$fieldEl.editable({
					type: editableType
				});
				$fieldEl.on('hidden', function(e) {
					$trigger.show();
				});
				$fieldEl.on('save', function(e, params) {
					var oldVal = $fieldEl.data('editable').value;
					var val = params.newValue;
					var result = Filter.cleanHotField(fieldName, val, $fieldEl);
					if (result.passed) {
						model.set(fieldName, val);
						model.save({}, {
							wait: true,
							success: function(updatedModel) {
								log('updatedModel', updatedModel);
								log('clientModel', model);
								// is server val == val ?  if no revert to oldVal?

							},
							error: function() {

							}
						});
					} else {

					}
				});
				var hotField = {
					field: fieldName,
					$trigger: $trigger,
					$fieldEl: $fieldEl
				};
				hotFields[fieldName] = hotField;
			});
		}();

		$formEl.on('click', 'button[data-edits]', function(e) {
			var target = $(e.target).closest('button').data('edits');
			var hotField = hotFields[target];
			if (hotField) {
				hotField.$fieldEl.editable('show');
				hotField.$trigger.hide();
				e.stopPropagation(); // Clicking anywhere cancels editable.  Cannot be allowed to bubble.
				e.preventDefault();		
			}
		});

	};

	return SmartForm;

});