const Web3WsProvider = require('web3-providers-ws');
const Web3 = require('web3');
const {rabbitMQClient} = require('../../helpers/rabbitMQConnection');
const log4js = require('log4js');
const logger = log4js.getLogger('[WEB3SOCKET]');
logger.level = process.env.LOG_LEVEL || 'debug';

module.exports = class TransactionSocket {
	web3ws
	provider_ws

	constructor() {
		this.provider_ws = new Web3WsProvider(global.conf.uri_wss, global.conf.optionsWss)
		this.web3ws = new Web3(this.provider_ws);

		this.provider_ws.on('error', err => {
			logger.error('WS Error', err);
			this.provider_ws = new Web3.providers.WebsocketProvider(global.conf.uri_wss);
			this.web3ws.setProvider(this.provider_ws);
		});

		this.provider_ws.on('end', async () => {
			logger.warn('WS closed');
			logger.warn('Attempting to reconnect...');
			this.provider_ws = new Web3.providers.WebsocketProvider(global.conf.uri_wss);
			this.web3ws.setProvider(this.provider_ws);
		});

		this.provider_ws.on('connect', function () {
			logger.debug('WSS connected');
		});

		rabbitMQClient.subscribe(conf.rabbitMQ.queueName);
	}

	subscribeSync() {
		this.web3ws.eth.subscribe('logs', async (err, res) => {
			if (!err) {
				logger.log(res);
			} else {
				logger.error(err)
			}
		});
	}

	subscribeNewBlock(topic = 'newBlockHeaders') {

		this.web3ws.eth.subscribe(topic, async (err, res) => {
			if (!err) {
				this.web3ws.eth.getBlock(res.number).then(async block => {
					await rabbitMQClient.sendToQueue(conf.rabbitMQ.queueName, { block }).then(()=>{
					})

					if (block !== undefined) {

						logger.log(`BLOCK: ${res.number} Transaction:  ${block.transactions}`);
					}
				});
			}
		})
	}

}
