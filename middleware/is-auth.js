const jwt = require('jsonwebtoken');

const { error } = require('../utils/withErrorHandler');

module.exports = (req, res, next) => {
	const authHeader = req.get('Authorization');

	if (!authHeader) {
		throw error({ message: 'Not authenticated.', statusCode: 401 });
	}

	try {
		const token = authHeader.split(' ')[1];

		const decodedToken = jwt.verify(token, 'supersecrettoken');

		if (!decodedToken) {
			throw error({ message: 'Not authenticated', statusCode: 401 });
		}

		req.userId = decodedToken.userId;

		next();
	} catch (error) {
		next(error);
	}
};
