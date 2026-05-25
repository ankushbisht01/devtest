/* eslint-env node */

function summarize(message) {
	return {
		to: message.to,
		from: message.from,
		subject: message.subject
	}
}

exports.send = function(message) {
	console.log('[dummy-mailer] Email suppressed:', summarize(message))
	return Promise.resolve({
		accepted: [message.to],
		dummy: true
	})
}
