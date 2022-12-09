const express = require('express');
const log4js = require('log4js')
const logger = log4js.getLogger('[APP]');
//logger.level = process.env.LOG_LEVEL || 'debug';

const config = require('./config');

const expressJSDocSwagger = require('express-jsdoc-swagger');
const cors = require('cors');
const router = require('./routes');
const createError = require('http-errors');
const errorHandler = require('./middleware/errorHandler');
const normalizePort = require('normalize-port');
const http = require('http');

module.exports = () => {
	const app = express();

	const swaggerListener = expressJSDocSwagger(app)(config.swaggerOptions);
	swaggerListener.on('error', (error) => {
		logger.info(`Swagger API Docs [ERROR]: ${error}`);
	});

	swaggerListener.on('finish', () => {
		logger.info(`Swagger API Docs: Finished.`);
	});

	app.use(cors())
	app.use(express.json());
	app.use(express.urlencoded({extended: true}));

	app.use(`/api/${process.env.VERSION}`, router);
	app.use(`/api/${process.env.VERSION}/static`, express.static('public'));

// catch 404 and forward to error handler
	app.use(function (req, res, next) {
		next(createError(404));
	});
	app.use(errorHandler)


	const PORT = normalizePort(conf.port || 3000);
	const httpServer = http.createServer(app)
	httpServer.timeout = 60000;

	httpServer.listen(PORT, function () {
		logger.debug(`Server listening on port ${PORT}`)
	})

	httpServer.on('error', function (err) {
		logger.error('Error, created httpServer', err.message);
	});

	return app;
}