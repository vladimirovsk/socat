import log4js from 'log4js';
const logger = log4js.getLogger('[HANDLER]');
logger.level =  process.env.LOG_LEVEL || 'debug';

export default function errorHandler(err, req, res, next) {
	const responseJSON = {
		success: false,
		error: '',
	};

	if (err.status >= 500) {
		logger.error(`Error app: ${err} at route ${req.originalUrl} with method ${req.method} and IP ${req.headers['cf-connecting-ip']}`);
		logger.error(`Error app stack: ${err.stack}`);
	}

	if (err.status >= 400) {
		logger.error(`Warning app: ${err} at route ${req.originalUrl} with method ${req.method} and IP ${req.headers['cf-connecting-ip']}`);
	}

	responseJSON.error = err.status === 404 ? 'Not found' : 'Something went wrong!';
	res.status(err.status || 500).json(responseJSON);
}



