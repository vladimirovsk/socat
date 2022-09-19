const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const router = require('./routes');
const log4js = require('log4js');
const normalizePort = require('normalize-port');
const errorHandler = require('./middleware/errorHandler.js');

const http = require('http');

const app = express();
const logger = log4js.getLogger('[SOCAT]');
logger.level = process.env.LOG_LEVEL || 'debug';

global.conf = require('./config');

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

process.on('unhandledRejection', (reason, promise) => {
	logger.error('Error:', reason.message)
});

httpServer.listen(PORT, function () {
	logger.debug(`Server listening on port ${PORT}`)
})

httpServer.on('error', function (err) {
	logger.error('Error, created httpServer', err.message);
});

require('./api/app.js');

module.exports = app;
global.db = require('./db')
