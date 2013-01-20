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
    	
    	var that = this;
    	that.hotFields = {};
    	that.$formEl = $formEl;
    	that.model = model;
		that.$triggerEl = $formEl.find('[data-submit-trigger=1]');
		that.origTriggerText = that.$triggerEl.text();

		var filterAction = $formEl.data('filter');
    	
    	if (!triggerAction) {
    		triggerAction = 'click';
    	}

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
				if (!$(e.target).data('ignore-enter')) {
					that.$triggerEl.trigger(triggerAction);
				}
	    	}
	  	});

		that.$triggerEl.on(triggerAction, function() {
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
					var val = $el.val();
					if ($el.attr('type') == 'checkbox') {
 						val = $el.is(':checked');
					}
					data[id] = val;
				});
				model.set(data);
	  			var loadingText = that.$triggerEl.data('loading-text');
	  			if (loadingText) {
	  				var html = '<i class="icon-refresh icon-spin"></i> ' + loadingText;
	  				that.$triggerEl.html(html);
	  			}
	  			that.$triggerEl.attr('disabled', true);

	  			submitFunction();
	  		}

	  	});

	  	that.initHotFields();

	};

	SmartForm.prototype.resetForm = function(clearVals) {
log('resetForm');
		if (clearVals) {
log(this.$formEl);
log(this.$formEl.find('input'));
			this.$formEl.find('input').val('');
			this.$formEl.find('.help-inline').text('');
			this.$formEl.find('.control-group').attr('class', 'control-group'); // Remove .success / .error
		}
		this.$triggerEl.text(this.origTriggerText);
		this.$triggerEl.removeAttr('disabled');
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
					//var prevVal = $fieldEl.data('editable').value;
					var newVal = params.newValue;
					var oldVal = model.get(fieldName);
					var ignoreOldVal = false;

					// SPECIAL CASES.
					if (fieldName == 'unconfirmedEmail') {
						oldVal = model.get('email');
					}
					if (fieldName == 'password') {
						ignoreOldVal = true;
					}

					var result = Filter.cleanHotField(fieldName, newVal, $fieldEl);					
					if (result.passed) {					
						model.set(fieldName, newVal);
						if (ignoreOldVal || oldVal != newVal) {
							var attr = {};
							attr[fieldName] = newVal;
log(attr);				
							model.save(attr, {
								wait: true,
								patch: true,
								success: function(updatedModel) {
									log('updatedModel', updatedModel);
									log('clientModel', model);

									// SPECIAL CASES.
									if (fieldName == 'unconfirmedEmail') {
										var $helpInline = $fieldEl.siblings('.help-inline');
										var $controlGroup = $fieldEl.closest('.control-group');
										$controlGroup.attr('class', 'control-group error')
										$helpInline.html([
											'<strong>You must confirm this new address by clicking the link we emailed you.</strong><br/>',
											'Until then your email will remain ', model.get('email')
										].join(''));
									}
									if (fieldName == 'password') {
										model.set('password', null);
									}

								},
								error: function() {
log("Unhandled Error: SmartForm couldn't save model to server.");
								}
							});
						}
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