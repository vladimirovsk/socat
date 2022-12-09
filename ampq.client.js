const {rabbitMQClient} = require('./helpers/rabbitMQConnection');
conf = require('./config');


const client  = async (queueName) =>{
		 const chanel = rabbitMQClient.getChannel();

		 rabbitMQClient.subscribe(conf.rabbitMQ.queueName);

		 await chanel.assertQueue(queueName, {persistent: true});
		 await chanel.consume(queueName, async (message)=>{
			 const data = JSON.parse(Buffer.from(message.content).toString());
			 if (typeof data.block.number === 'number'){
				 console.log(`CHECK BLOCK: ${data.block.number}`);
				 chanel.ack(message);
			 }
		 }, {noAck: false});

}

const clientError = async (queueName) => {
	const chanel = rabbitMQClient.getChannel();
	rabbitMQClient.subscribe(conf.rabbitMQ.queueName);
	await chanel.assertQueue(queueName+'_error', {persistent: true});
	await chanel.consume(queueName+'_error', async (message)=>{
		const data =  Buffer.from(message.content).toString() ;
		console.log(`ERROR READ BLOCK: ${data}`);
		// if (typeof data.block.number === 'number'){
		// 	console.log(`ERROR READ BLOCK: ${data.block.number}`);
		// 	chanel.ack(message);
		// }
	}, {noAck: false});
}

clientError(conf.rabbitMQ.queueName);
// client(conf.rabbitMQ.queueName);

module.exports = client;