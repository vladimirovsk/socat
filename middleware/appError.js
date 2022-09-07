module.exports = class AppError extends Error {
	constructor(message, code) {
		super(message);
		this.status = false
		this.code = code
	}
}

