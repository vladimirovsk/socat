const Web3WsProvider = require('web3-providers-ws');
const Web3 = require('web3');

module.exports = class TransactionSocket {
	web3ws
	provider_ws

	constructor() {
		this.provider_ws = new Web3WsProvider(global.conf.uri_wss, global.conf.optionsWss)
		this.web3ws = new Web3(this.provider_ws);

		this.provider_ws.on('error', err => {
			console.log('WS Error', err);
			this.provider_ws = new Web3.providers.WebsocketProvider(global.conf.uri_wss);
			this.web3ws.setProvider(this.provider_ws);
		});

		this.provider_ws.on('end', async () => {
			console.log('WS closed');
			console.log('Attempting to reconnect...');
			this.provider_ws = new Web3.providers.WebsocketProvider(global.conf.uri_wss);
			this.web3ws.setProvider(this.provider_ws);
		});

		this.provider_ws.on('connect', function () {
			console.log('WSS connected');
		});
	}

	subscribeSync() {
		this.web3ws.eth.subscribe('logs', async (err, res) => {
			if (!err) {
				console.log(res);
			} else {
				console.log(err)
			}
		});
	}

	subscribeNewBlock(topic = 'newBlockHeaders') {
		this.web3ws.eth.subscribe(topic, async (err, res) => {
			if (!err) {
				this.web3ws.eth.getBlock(res.number).then(async block => {
					if (block !== undefined) {
						console.log('BLOCK:', res.number, 'Transaction:', block.transactions);
					}
				});
			}
		})
	}

}
