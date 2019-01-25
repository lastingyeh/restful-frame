module.exports = {
	withErrorHandler(action) {
		return async (req, res, next) => {
			try {
				await action(req, res);
			} catch (error) {
				console.log('error', error);

				if (!error.statusCode) {
					error.statusCode = 500;
				}
				next(error);
			}
		};
	},
	error({ message, statusCode }, meta) {
		const error = new Error(message);
		error.statusCode = statusCode;
		error.data = meta;

		return error;
	},
};
