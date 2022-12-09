/* eslint-disable camelcase */
const {connect} = require('amqp-connection-manager');
const log4js = require('log4js');

global.conf = require('../config');

const log = log4js.getLogger('[RABBITMQ]');
const rabbitMQConfig = conf.rabbitMQ;

/**
 * Creates a new RabbitMQConnectionNew.
 * @class RabbitMQConnection class
 */
class RabbitMQConnection {
	#connection;
	#channel;
	systemName='Sockat';

	constructor() {
		this.#connection = null;
		this.#channel = 'logs';
		this.consumeWithRetryDefaultOptions = rabbitMQConfig.consumeWithRetryDefaultOptions;
	}

	getConnection = () => this.#connection;
	getChannel = () => this.#channel;

	/**
	 * Connect to RabbitMQ server
	 */
	connect = () => {
		this.#connection = connect(rabbitMQConfig.server, rabbitMQConfig.options);
		this.#connection.on('connect', () => log.info('RabbitMQ successfully connected.'));
		this.#connection.on('connectFailed', (error) => log.error(`RabbitMQ connect failed. ${error.err}`));
		this.#connection.on('disconnect', (error) => log.error('RabbitMQ disconnected.', error.err));
		this.#channel = this.#connection.createChannel({ json: true});
		this.#channel.on('close', () => log.info('Close channel'));
	};

	healthCheck() {
		try {
			const isReady = !!this.#connection.connection;
			return {isReady};
		} catch (error) {
			return {isReady: false, error};
		}
	}

	/**
	 * Disconnect from RabbitMQ server
	 * @return {Promise<void>}
	 */
	disconnect = async () => {
		try {
			await this.#channel.close();
			await this.#connection.close();
		} catch (error) {
			log.error(`Error on disconnect RabbitMQ: ${error}`);
			log.error(error);
		}
	};

	/**
	 * Send message to the queue
	 * @param {string} queueName
	 * @param {Buffer | string | unknown} message
	 * @return {Promise<void>}
	 */
	sendToQueue = async (queueName, message) => {
		if ( !this.#connection) {
			await this.connect();
		}

		await this.#channel.sendToQueue(queueName, message, {
			persistent: true
		})
			.catch(async (error) => {
				log.error('Message was rejected:', error);
				log.error(error);
				await this.disconnect();
			})
	};

	/**
	 * Returns a setup function for queueName to assert the topology
	 * Calling this with different waitIntervalSec will crete different wait queues
	 * @param queueName - Name of the main queue
	 * @param waitIntervalSec - Time in seconds the message should wait to retry
	 * @param {number?} prefetchCount - Prefetch count for this channel.
	 * @returns {(function(*): Promise<void>)|*}  Setup function for queueName to assert the topology
	 */
	#setupForQueue = (queueName, waitIntervalSec, prefetchCount) => {
		return async (ch) => {
			const queueRetryDLXName = `${queueName}_retry-dlx`;
			const systemWaitQueueName = `${this.systemName}-wait-queue-${waitIntervalSec}`;
			const retryDispatcherDLXName = `${this.systemName}_retry-dispatcher-dlx`;
			//* routing key of the retry DLX
			const queueRetryDLX_DLRoutingKey = `rt-${waitIntervalSec}.${queueName}`;
			//* assert topology
			await Promise.all([
				//* asset queue retry-dlx
				ch.assertExchange(queueRetryDLXName, 'topic', {
					arguments: {
						'x-dead-letter-routing-key': queueRetryDLX_DLRoutingKey,
					},
					durable: true,
					noAck: true,
				}),
				//* assert system-retry-dlx
				ch.assertExchange(retryDispatcherDLXName, 'topic', {
					durable: true,
					noAck: true,
				}),
				//* assert main queue
				ch.assertQueue(queueName, {
					durable: true,
					deadLetterExchange: queueRetryDLXName, //  bind queue -> retry-dlx
					deadLetterRoutingKey: queueRetryDLX_DLRoutingKey,
				}),
				ch.prefetch(prefetchCount),
				//* assert queue error queue
				ch.assertQueue(this.constructor.#getQueueErrorQueueName(queueName), {
					durable: true,
					deadLetterExchange: queueRetryDLXName, //  bind queue -> retry-dlx
				}),
				//* assert system-wait-queue
				ch.assertQueue(systemWaitQueueName, {
					durable: true,
					deadLetterExchange: retryDispatcherDLXName, // bind system-wait-queue -> system-retry-dlx
					messageTtl: waitIntervalSec * 1_000,
				}),

				//* binds
				//* bind retry-dlx -> system-wait-queue
				ch.bindQueue(systemWaitQueueName, queueRetryDLXName, `rt-${waitIntervalSec}.#`),
				//*  bind system-retry-dlx -> queue
				ch.bindQueue(queueName, retryDispatcherDLXName, `#.${queueName}`),
			]);
		};
	};

	/**
	 * Assert the topology necessary for the retry and registers the callback as consumer of the queue
	 * @param queueName - Name of the queue to be consumed
	 * @param callback - Consumer callback called with the parsed json data. Can return a Promise to be awaited
	 * @param {number?} prefetch - Prefetch count for this channel.
	 * @param options - Options for retry strategy
	 *                  waitIntervalSec - Wait time for messages to be retried. A new queue is created everytime a this receives a new value
	 *                  maxRetries - Maximum number of retries before sending the message to the error queue
	 * @returns {Promise<void>}
	 */
	subscribe = async (queueName, callback, prefetch = 1, options = this.consumeWithRetryDefaultOptions) => {
		if ( !this.#connection) {
			await this.connect();
		}
		const {waitIntervalSec, maxRetries} = {...this.consumeWithRetryDefaultOptions, ...options};
		const setupFn = this.#setupForQueue(queueName, waitIntervalSec, prefetch);
		log.trace(`rabbitManager:: adding queue ${queueName} setup.`);
		const consumerChannel = this.#connection.createChannel({
			json: true,
		});
		await consumerChannel.addSetup(setupFn);
		log.trace(`rabbitManager:: registering queue ${queueName} consumer.`);
		await consumerChannel.consume(queueName, async (data) => {
			const deathCount = this.constructor.#getDeathCount(data);
			if (deathCount) {
				log.error(`rabbitManager::Message in queue: ${queueName}, received: ${data.content} - [deaths:${deathCount}/${maxRetries}]`);
			}
			if (deathCount >= maxRetries) {
				log.error(`rabbitManager:: maximum retries reached (deaths: ${deathCount}) for message: ${data.content.toString()}, publishing to error queue...`);
				//* Publish to error queue if max retries reached
				await consumerChannel.sendToQueue(this.constructor.#getQueueErrorQueueName(queueName), data.content, {persistent: true});
				//* ack message to remove from original queue
				consumerChannel.ack(data);
				return false;
			}
			try {
				const message = JSON.parse(Buffer.from(data.content).toString());
				// const processMsg = await callback(message);
				if (message){
			 	// if ( !processMsg.success) {
			 		return consumerChannel.nack(data, false, false);
			 	}
			 	consumerChannel.ack(data);
			 } catch (e) {
			 	//* On error, nack the message with requeue false to make it go to retry-dlx directly
			 	log.error(`rabbitManager:: nacking message: ${Buffer.from(data.content).toString()}, ${e}`);
			 	consumerChannel.nack(data, false, false);
			 }
		});
	};

	/**
	 * Attempt to get death count from message.
	 * @param data
	 * @returns {((label?: string) => void)|number|((key?: (IDBValidKey | IDBKeyRange)) => IDBRequest<number>)|number|number}
	 */
	static #getDeathCount = (data) => {
		if ( !data || !data.properties || !data.properties.headers || !data.properties.headers['x-death']) {
			return 0;
		}
		try {
			return data.properties.headers['x-death'][0].count || 0;
		} catch (e) {
			log.error('rabbitManager.getDeathCount:: ERROR:', e);
			return 0;
		}
	};

	/**
	 * Build the error queue name for unprocessable messages after retry
	 * @param queueName - Name of the main queue
	 * @returns {`${string}_error`} - Error queue name
	 */
	static #getQueueErrorQueueName = (queueName) => `${queueName}_error`;
}

const rabbitMQClient = new RabbitMQConnection();
rabbitMQClient.connect();

module.exports = {rabbitMQClient};
