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

	var sendEmail = function(to, subject, bodyText, bodyHtml) {
		
		if (!bodyHtml) {
			bodyHtml = bodyText.replace(/\r\n/g, '<br/>');
		}

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

		Log.l(mail);
		return Q.ncall(
			ses.send,
			this,
			mail
		);
	};

	Email.sendCreateAccountEmailConfirmation = function(user, link) {
		var subject = 'Welcome to Dayze! Please confirm your email address.';
		var bodyText = [
			'Thanks for joining Dayze!\r\n',
			'Can you just click this link so we know your email is real?\r\n',
			'We promise to only email you invites and never spam or reveal this address.\r\n',
			'\r\n\r\n',
			'http://localhost:8000/link/', link.linkId
		].join('');
		/*
		var bodyHtml = [
			'Thanks for joining Dayze!<br/>',
			'Can you just click this link so we know your email is real?<br/>',
			'We promise to only email you invites and never spam or reveal this address.<br/>',
			'<br/><br/>',
			'<a href="http://localhost:8000/link/', link.linkId, '">http://localhost:8000/link/', link.linkId, '</a>'
		].join('');
		*/
		return sendEmail(user.email, subject, bodyText, null);
	};

	return Email;

});