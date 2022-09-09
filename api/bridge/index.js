import log4js from 'log4js';

const logger = log4js.getLogger('[BRIDGE]');
logger.level = process.env.LOG_LEVEL || 'debug';

async function start() {
	logger.info('Init');
}

await start();


