import createError from 'http-errors';
import express from 'express';
import cors from 'cors';
import router from './routes/index.js';
import log4js from 'log4js';
import conf from './config.js'
import normalizePort from 'normalize-port';
import errorHandler from './middleware/errorHandler.js';
import * as  db from './db/index.js'
import http from 'http';
const app = express();
const logger = log4js.getLogger('[SOCAT]');
logger.level = process.env.LOG_LEVEL || 'debug';

global.conf = conf;


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


global.db = db;
