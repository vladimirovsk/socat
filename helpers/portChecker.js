const net = require("net");

 class PortChecker {
	async testPort(port, host) {
		return new Promise((resolve, reject) => {
			const socket = new net.Socket();

			socket.on("connect", () => {
				socket.destroy();
				resolve(true);
			});

			socket.on("timeout", () => {
				socket.destroy();
				resolve(false);
			});

			socket.on("error", () => {
				socket.destroy();
				resolve(false);
			});

			socket.connect(port, host);

		});
	}
}

module.exports = {
	 PortChecker
}