////////////////////////////////////////////////////////////////////////////////
// 
// EMAIL
//
////////////////////////////////////////////////////////////////////////////////
define([
	'log', // The 'log' package.  Hence why this is called logg.
	'config',
	'amazon-ses',
	'q'
], function(
	Logger,
	Config,
	AmazonSES,
	Q
) {

	var Email = {};
	var ses = new AmazonSES(Config.AWS_ACCESS_KEY_ID, Config.AWS_SECRET_ACCESS_KEY);

	var sendEmail = function(to, subject, bodyText, bodyHtml) {
		var mail = {
			from: Config.EMAIL_FROM_ADDRESS,
			to: [].concat(to),
			replyTo: [Config.EMAIL_FROM_ADDRESS],
			subject: subject,
			body: {
				text: bodyText
			}
		};
		if (bodyHtml) {
			mail.body.html = bodyHtml;
		}
		return Q.ncall(
			ses.send,
			this,
			mail
		);
	};

	Email.sendCreateAccountEmailConfirmation = function(user, callback) {
		var subject = 'Welcome to ScheduleItUp! Please confirm your email address.';
		var bodyText = 'something something.';
		return sendEmail(user.email, subject, bodyText, null);
	};

	return Email;

});