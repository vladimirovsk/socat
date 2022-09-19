const EventEmitter = require('events');
const TransactionSocket = require('./blockchain/web3Socket');
const TransactionRest = require('./blockchain/web3Rest');

const flowEmitter = new EventEmitter;

flowEmitter.setMaxListeners(flowEmitter.getMaxListeners() + 1);
global.eventEmitter = flowEmitter;

async function start() {
	/**
	 * connected to Web3Socket
	 */
	new TransactionSocket().subscribeNewBlock();
	const txRest = new TransactionRest();
	await txRest.getNetworkId();
}

start();





