import EventEmitter from 'events';
import TransactionSocket from './blockchain/web3Socket.js';
import TransactionRest from './blockchain/web3Rest.js';
import log4js from 'log4js';

const flowEmitter = new EventEmitter;

const logger = log4js.getLogger('[APP]');
logger.level = process.env.LOG_LEVEL || 'debug';

flowEmitter.setMaxListeners(flowEmitter.getMaxListeners() + 1);
global.eventEmitter = flowEmitter;

async function start() {
	/**
	 * connected to Web3Socket
	 */
	new TransactionSocket().subscribeNewBlock();
	const txRest = new TransactionRest();
<<<<<<< HEAD
	const networkId = await txRest.getNetworkId();
	logger.debug(`NETWORK ID: ${networkId}`);
=======
	await txRest.getNetworkId();
>>>>>>> master
}

start();





