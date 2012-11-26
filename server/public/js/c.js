/////////////////////////////////////////////////////////////////////////////////////////
// CONSTANTS
/////////////////////////////////////////////////////////////////////////////////////////
define([], function() {

	var C = {};

	C.SUPPRESS_SERVER_CALLS = true;
	C.Domain = "http://localhost:8000";

	C.WEEK_SCROLL_BUFFER = 50;
	C.PAST_WEEKS_TO_SHOW = 20;

	C.ActiveViews = {};
	C.ActiveViews.Day = 1;
	C.ActiveViews.Calendar = 2;
	C.ActiveViews.CreateAccount = 3;
	C.ActiveViews.Account = 4;

	return C;

});
