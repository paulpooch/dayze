////////////////////////////////////////////////////////////////////////////////
// 
// EMAIL
//
////////////////////////////////////////////////////////////////////////////////
define([
	'logg', // The 'log' package.  Hence why this is called logg.
	'config',
	'amazon-ses',
	'q'
], function(
	Log,
	Config,
	AmazonSES,
	Q
) {

	var Email = {};
	var ses = new AmazonSES(Config.AWS_ACCESS_KEY_ID, Config.AWS_SECRET_ACCESS_KEY);

	var footerText = function(userId) {
		return [
			'\r\n\r\n',
			'Love, DayPaint.co',
			'\r\n\r\n',
			'[This email is from a robot so replies will not be read.]\r\n',
			'[UNSUBSCRIBE HERE: http:', Config.URL_ROOT, 'unsubscribe/', userId, ']'
		].join('');
	};

	var footerHtml = function(userId) {
		return [
			'<br/><br/>',
			'Love, DayPaint.co',
			'<br/><br/>',
			'[This email is from a robot so replies will not be read.]<br/>',
			'[<a href="http:', Config.URL_ROOT, 'unsubscribe/', userId, '">UNSUBSCRIBE HERE</a>]'
		].join('');
	};
	
	var sendEmail = function(user, to, subject, bodyText, bodyHtml) {
		
		if (!bodyHtml) {
			bodyHtml = bodyText.replace(/\r\n/g, '<br/>');
		}
		bodyText += footerText(user.userId);
		bodyHtml += footerHtml(user.userId);

		var mail = {
			from: Config.EMAIL_FROM_ADDRESS,
			to: [].concat(to),
			replyTo: [Config.EMAIL_FROM_ADDRESS],
			subject: subject,
			body: {
				text: bodyText,
				html: bodyHtml
			}
		};
Log.l('Gonna attempt to send mail: ', mail);
		return Q.ncall(
			ses.send,
			this,
			mail
		);
	};

	Email.sendEmailConfirmation = function(user, link) {
Log.l('Email.sendEmailConfirmation', user, link);
		var subject = 'Welcome to DayPaint! Please confirm your email address.';
		var bodyText = [
			'Thanks for joining DayPaint!\r\n',
			'Can you just click this link so we know your email is real?\r\n',
			'We promise to only email you invites and never spam or reveal this address.\r\n',
			'\r\n\r\n',
			'http:', Config.URL_ROOT, 'account/confirm_email/', link.linkId
		].join('');
		return sendEmail(user, user.unconfirmedEmail, subject, bodyText, null);
	};

	return Email;

});