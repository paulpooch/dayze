/////////////////////////////////////////////////////////////////////////////////////////
// CLIENT CONSTANTS (& SHARED)
/////////////////////////////////////////////////////////////////////////////////////////
define([], function() {

	var C = {};

	C.SUPPRESS_SERVER_CALLS = false;
	C.Domain = "http://localhost:8000";

	C.WEEK_SCROLL_BUFFER = 50;
	C.PAST_WEEKS_TO_SHOW = 20;
	C.PULL_EVENTS_FOR_MONTH_DELAY = 1000;
	C.RESERVED_VERTICAL_SPACE = 90;

	C.KEY_ENTER = 13;

	C.EmailInvitee = 1;

	C.AutoSuggestType = {};
	C.AutoSuggestType.Friend = 1;
	C.AutoSuggestType.Plan = 2;

	C.ActiveViews = {};
	C.ActiveViews.Day = 1;
	C.ActiveViews.Calendar = 2;
	C.ActiveViews.Account = 3;
	C.ActiveViews.Basic = 4;
	C.ActiveViews.Thinking = 5;

	C.FilterAction = {};
	C.FilterAction.FriendList = 'friend.list';
	C.FilterAction.LinkRead = 'link.read';
	C.FilterAction.EventList = 'event.list';
	C.FilterAction.EventCreate = 'event.create';
	C.FilterAction.EventAdd = 'event.add';
	C.FilterAction.EventRead = 'event.read';
	C.FilterAction.AccountList = 'account.list';
	C.FilterAction.AccountCreate = 'account.create';
	C.FilterAction.AccountLogin = 'account.login';
	C.FilterAction.AccountOAuthGoogleLogin = 'account.oAuthGoogleLogin';
	C.FilterAction.AccountPasswordChange = 'account.password';
	C.FilterAction.AccountForgot = 'account.forgot';

	C.HttpCodes = {};
	// Add more if you need to - http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
	
	// CLIENT ERRORS - The 4xx class of status code is intended for cases in which the client seems to have erred.
	C.HttpCodes.BadRequest = 400; 	// Bad Request - The request cannot be fulfilled due to bad syntax.
	C.HttpCodes.Unauthorized = 401; // Unauthorized - Authentication is required and has failed or has not yet been provided.
	C.HttpCodes.Forbidden = 403; 	// Forbidden - Unlike a 401 Unauthorized response, authenticating will make no difference.
									// This commonly means that the provided credentials were successfully authenticated but that the credentials still do not grant the client permission to access the resource (e.g. a recognized user attempting to access restricted content).
	C.HttpCodes.NotFound = 404; 	// Not Found - The requested resource could not be found but may be available again in the future.
	C.HttpCodes.MethodNotAllowed = 405; // Method Not Allowed - A request was made of a resource using a request method not supported by that resource;
										// For example, using GET on a form which requires data to be presented via POST, or using PUT on a read-only resource.
	C.HttpCodes.RequestTimeout = 408; 	// Request Timeout - The server timed out waiting for the request.
	C.HttpCodes.Gone = 410; 			// Gone - Indicates that the resource requested is no longer available and will not be available again.
	C.HttpCodes.TooManyRequests = 429; 	// Too Many Requests (RFC 6585) The user has sent too many requests in a given amount of time. Intended for use with rate limiting schemes.
	
	// SERVER ERRORS - The server failed to fulfill an apparently valid request.
	C.HttpCodes.GenericServerError = 500; 	// Internal Server Error - A generic error message, given when no more specific message is suitable.
	C.HttpCodes.NotImplemented = 501; 		// Not Implemented - The server either does not recognize the request method, or it lacks the ability to fulfill the request.

	C.Errors = {};
	C.ErrorCodes = {};
	C.ErrorCodes.External = 1;
	C.ErrorCodes.Filter = 2;
	C.ErrorCodes.AccountLoginPassword = 10;
	C.ErrorCodes.AccountLoginEmail = 11;
	C.ErrorCodes.AccountLoginPartialAccount = 12;
	C.ErrorCodes.AccountNoCookie = 13;
	C.ErrorCodes.AccountNotYourId = 14;
	C.ErrorCodes.AccountEmailTaken = 15;
	C.ErrorCodes.AccountForgotNoAccount = 16;
	C.ErrorCodes.LinkNotForUser = 21;
	C.ErrorCodes.LinkUsed = 22;
	C.ErrorCodes.LinkExpired = 23;
	C.ErrorCodes.LinkInvalid = 24;
	C.ErrorCodes.InvalidOAuthToken = 25;

	// SPECIAL CASE ERRORS
	C.Errors[C.ErrorCodes.External] = {
		code: C.ErrorCodes.External,
		httpCode: C.HttpCodes.GenericServerError,
		message: 'An unknown server error occured.'
	};

	C.Errors[C.ErrorCodes.Filter] = {
		code: C.ErrorCodes.Filter,
		httpCode: C.HttpCodes.BadRequest,
		message: null // Will be replaced.
	};
	// END SPECIAL CASE ERRORS

	C.Errors[C.ErrorCodes.AccountLoginPassword] = {
		code: C.ErrorCodes.AccountLoginPassword,
		httpCode: C.HttpCodes.Unauthorized,
		message: 'Incorrect password.  Looks like your memory is going.'
	};

	C.Errors[C.ErrorCodes.AccountLoginEmail] = {
		code: C.ErrorCodes.AccountLoginEmail,
		httpCode: C.HttpCodes.NotFound,
		message: 'No account with that email exists so good luck with that.'
	};

	C.Errors[C.ErrorCodes.AccountLoginPartialAccount] = {
		code: C.ErrorCodes.AccountLoginPartialAccount,
		httpCode: C.HttpCodes.BadRequest,
		message: 'This account was not fully created.  Please use the forgot password link.'
	};

	C.Errors[C.ErrorCodes.AccountNoCookie] = {
		code: C.ErrorCodes.AccountNoCookie,
		httpCode: C.HttpCodes.Unauthorized,
		message: 'User has no cookieId.'
	};

	C.Errors[C.ErrorCodes.AccountNotYourId] = {
		code: C.ErrorCodes.AccountNotYourId,
		httpCode: C.HttpCodes.Forbidden,
		message: 'Account requested was not your account.'
	};

	C.Errors[C.ErrorCodes.AccountEmailTaken] = {
		code: C.ErrorCodes.AccountEmailTaken,
		httpCode: C.HttpCodes.BadRequest,
		message: 'There is already an account with this email.'
	};

	C.Errors[C.ErrorCodes.AccountForgotNoAccount] = {
		code: C.ErrorCodes.AccountForgotNoAccount,
		httpCode: C.HttpCodes.NotFound,
		message: 'These is no account with this email.'
	};

	C.Errors[C.ErrorCodes.LinkNotForUser] = {
		code: C.ErrorCodes.LinkNotForUser,
		httpCode: C.HttpCodes.Forbidden,
		message: 'Link is not for this user.'
	};

	C.Errors[C.ErrorCodes.LinkUsed] = {
		code: C.ErrorCodes.LinkUsed,
		httpCode: C.HttpCodes.Gone,
		message: 'Link was already used.'
	};

	C.Errors[C.ErrorCodes.LinkExpired] = {
		code: C.ErrorCodes.LinkExpired,
		httpCode: C.HttpCodes.Gone,
		message: 'Link is expired.'
	};

	C.Errors[C.ErrorCodes.LinkInvalid] = {
		code: C.ErrorCodes.LinkInvalid,
		httpCode: C.HttpCodes.NotFound,
		message: 'LinkId was invalid.'
	};

	C.Errors[C.ErrorCodes.InvalidOAuthToken] = {
		code: C.ErrorCodes.LinkInvalid,
		httpCode: C.HttpCodes.BadRequest,
		message: 'Invalid oAuth token.'
	};

	C.Strings = {};
	C.Strings.ResetPassword = function(p) {
		return 'A password reset link was sent to ' + p + '.<br/>The links expires in 3 days.<br/>';
	};

	// Makes testing for correct error message easy.
	C.FilterErrors = {};
	C.FilterErrors.DayCode = 'dayCode must be a valid YYYY-MM-DD format.';
	C.FilterErrors.MonthCode = 'monthCode must be a valid YYYY-MM format.';
	C.FilterErrors.Email = 'Email must be a valid email between 1 and 100 characters long.';
	C.FilterErrors.Password = 'Password must be at least 5 characters long.';
	C.FilterErrors.DisplayName = 'Display name must be 3 or more printable characters.';
	C.FilterErrors.Boolean = 'Invalid boolean value.';
	C.FilterErrors.LinkId = 'Invalid linkId.';
	C.FilterErrors.UUID = 'Invalid UUID.';
	C.FilterErrors.Action = 'Invalid action.';
	C.FilterErrors.Alpha = 'Value must be 1 to 100 alphabetic characters.';
	C.FilterErrors.EventDescription = 'Description must be 1000 or less printable characters.';
	C.FilterErrors.EventLocation = 'Location must be 100 or less printable characters.';
	C.FilterErrors.EventName = 'Name must be 1 to 30 printable characters.';
	C.FilterErrors.Time = 'Time must be valid (3:30pm).';
	C.FilterErrors.OAuthToken = 'Invalid oAuth token format';
	C.FilterErrors.Invited = 'Invite list contained an invalid entry.';

	C.Links = {};
	C.Links.Expiration = {};
	C.Links.EmailConfirmation = 'email_confirmation';
	C.Links.Expiration[C.Links.EmailConfirmation] = 7; // 7 days
	C.Links.ResetPassword = 'reset_password';
	C.Links.Expiration[C.Links.ResetPassword] = 3;

	C.States = {};
	C.States.Saved = 'saved';
	C.States.Created = 'created';
	C.States.InitialPasswordSet = 'initialPwSet';
	C.States.Create = 'create';
	C.States.ForgotPassword = 'forgotPassword';
	C.States.PasswordReset = 'passwordReset';
	C.States.Logout = 'logout';
	C.States.Login = 'login';
	C.States.GoogleLogin = 'googleLogin';
	C.States.GoogleCreated = 'googleCreated';
	C.States.FacebookLogin = 'facebookLogin';
	// Not really States... just used for frontDoor.
	C.States.AccountList = 'accountList';
	C.States.Link = 'link';

	C.FrontDoorSpecialCase = {};
	C.FrontDoorSpecialCase.NoAccountRequired = {};
	C.FrontDoorSpecialCase.NoAccountRequired[C.States.AccountList] = 1;
	C.FrontDoorSpecialCase.NoAccountRequired[C.States.Login] = 1;
	C.FrontDoorSpecialCase.NoAccountRequired[C.States.ForgotPassword] = 1;
	C.FrontDoorSpecialCase.NoAccountRequired[C.States.Link] = 1;

	return C;

});
