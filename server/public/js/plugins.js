// Avoid `console` errors in browsers that lack a console.
if (!(window.console && console.log)) {
    (function() {
        var noop = function() {};
        var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'markTimeline', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
        var length = methods.length;
        var console = window.console = {};
        while (length--) {
            console[methods[length]] = noop;
        }
    }());
}

// Place any jQuery/helper plugins in here.
$(function() {

	$('#page_holder').on('keyup', 'input.time_input', function() {
		
		var valid = false;
		var val = $(this).val().toLowerCase();
		var digits = val.replace(/[^0-9]/g, '');
		
		if (digits.length > 2 && digits.length < 5) {
			var am = val.indexOf('am') > -1;
			var pm = val.indexOf('pm') > -1;
			var amPm = (am ^ pm);
			if (amPm) {
				valid = true;
				digits = digits.substr(0, digits.length - 2) + ':' + digits.substr(digits.length - 2, 2);
				amPm = (am > pm) ? ' am' : ' pm';
				$(this).val(digits + amPm);
			}
		}

		var controlGroup = $(this).parents('.control-group');
		var msg = controlGroup.find('.help-inline');

		if (val == '') {
			controlGroup.removeClass('error').removeClass('success');
			msg.text('');
		} else {
			if (valid) {
				controlGroup.removeClass('error').addClass('success');
				msg.text('OK');
			} else {
				controlGroup.removeClass('success').addClass('error');
				msg.text('Please enter a valid time with am/pm.');
			}
		}

		// Otherwise change event doesn't fire.
		$(this).trigger('change');

	});

});

// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  if(this.console) {
    arguments.callee = arguments.callee.caller;
    var newarr = [].slice.call(arguments);
    (typeof console.log === 'object' ? log.apply.call(console.log, console, newarr) : console.log.apply(console, newarr));
  }
};

// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,timeStamp,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();){b[a]=b[a]||c}})((function(){try
{console.log();return window.console;}catch(err){return window.console={};}})());

