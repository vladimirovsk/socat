global.conf = require('./config');
const { rabbitMQClient } = require("./helpers/rabbitMQConnection");
const log4jsConfig = conf.log4js;
const log4js = require('log4js').configure(log4jsConfig);
const app = require('./app');

const { PortChecker } = require("./helpers/portChecker")

const portChecker = new PortChecker()

const checkHosts = global.conf.checkHostEnabled || [];

checkHosts.map(row =>{
	portChecker.testPort(row.port, row.host).then((result)=>{
		logger.info(`Is ${row.host}:${row.port} work: ${result}`);
	}).catch(err=>{
		logger.info(`Error open url: ${row.host}:${row.port}`);
	})
})

const logger = log4js.getLogger('[MAIN]');
logger.level = process.env.LOG_LEVEL || 'debug';

process.on('unhandledRejection', (reason, promise) => {
	logger.error('Error:', reason.message)
});

require('./api/app.js');
const { config } = require("dotenv");

module.exports = app;
global.db = require('./db')
