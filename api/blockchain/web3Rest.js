import Web3 from 'web3';

export default class TransactionRest {
	web3
	constructor() {
		this.web3 = new Web3(new Web3.providers.HttpProvider(global.conf.uri));
	}

	getWeb3() {
		return this.web3;
	}

	async getNetworkId() {
		const id = await this.web3.eth.net.getId()
		return id;
	}
}


