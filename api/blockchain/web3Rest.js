const  Web3 = require('web3');
const log4js = require('log4js');
const logger = log4js.getLogger('[WEB3REST]');
logger.level = process.env.LOG_LEVEL || 'debug';

module.exports = class TransactionRest {
	web3
	constructor() {
		this.web3 = new Web3(new Web3.providers.HttpProvider(global.conf.uri));
	}

	getWeb3() {
		return this.web3;
	}

	async getNetworkId() {
		try {
			const id = await this.web3.eth.net.getId()
			logger.log(`NETWORK_ID: ${id}`);
			return id;
		}catch (error) {
			logger.error(`NETWORK_ID ERROR: ${error}`);
			throw error;
		}
	}
}


