const log4js = require('log4js');
const log = log4js.getLogger('app');

function errorHandler(err, req, res, next) {
	const responseJSON = {
		success: false,
		error: '',
	};

	if (err.status >= 500) {
		log.error(`Error app: ${err} at route ${req.originalUrl} with method ${req.method} and IP ${req.headers['cf-connecting-ip']}`);
		log.error(`Error app stack: ${err.stack}`);
	}

	if (err.status >= 400) {
		log.warn(`Warning app: ${err} at route ${req.originalUrl} with method ${req.method} and IP ${req.headers['cf-connecting-ip']}`);
	}

	responseJSON.error = err.status === 404 ? 'Not found' : 'Something went wrong!';
	res.status(err.status || 500).json(responseJSON);
}

module.exports = errorHandler

