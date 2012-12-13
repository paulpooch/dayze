/////////////////////////////////////////////////////////////////////////////////////////
// CONSTANTS
/////////////////////////////////////////////////////////////////////////////////////////
define([], function() {

	var C = {};

	C.SUPPRESS_SERVER_CALLS = false;
	C.Domain = "http://localhost:8000";

	C.WEEK_SCROLL_BUFFER = 50;
	C.PAST_WEEKS_TO_SHOW = 20;
	C.PULL_EVENTS_FOR_MONTH_DELAY = 1000;

	C.ActiveViews = {};
	C.ActiveViews.Day = 1;
	C.ActiveViews.Calendar = 2;
	C.ActiveViews.Account = 3;
	C.ActiveViews.Basic = 4;
	C.ActiveViews.Thinking = 5;

	return C;

});
