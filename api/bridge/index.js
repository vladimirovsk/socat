const {
	GetTransferConfigsRequest,
	GetTransferConfigsResponse
}= require('../../bridge-api/ts-proto/gateway/gateway_pb.js');

import {WebClient}  from  '../../bridge-api/ts-proto/gateway/GatewayServiceClientPb'; //= require('../../bridge-api/ts-proto/gateway/GatewayServiceClientPb');

async function start() {
	const request = new GetTransferConfigsRequest();
	const client = new WebClient(`https://cbridge-v2-test.celer.network`, null, null);
	const response = await client.getTransferConfigs(request, null);
	console.log(request);
	console.log(client);
	console.log(response);
}

start();


