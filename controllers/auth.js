const { validationResult } = require('express-validator/check');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const { error } = require('../utils/withErrorHandler');

module.exports = {
	async signup(req, res) {
		// check body
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			throw error(
				{ message: 'Validation falied.', statusCode: 422 },
				errors.array(),
			);
		}

		const { email, name, password } = req.body;

		const _password = await bcrypt.hash(password, 12);

		const user = await new User({
			email,
			password: _password,
			name,
		}).save();

		res.status(201).json({ message: 'User created.', userId: user._id });
	},
	async login(req, res) {
		const { email, password } = req.body;

		const user = await User.findOne({ email });

		if (!user) {
			throw error({ message: 'No user found', statusCode: 401 });
		}

		const isValid = await bcrypt.compare(password, user.password);

		if (!isValid) {
			throw error({ message: 'Wrong password', statusCode: 401 });
		}

		const token = jwt.sign(
			{ email: user.email, userId: user._id.toString() },
			'supersecrettoken',
			{ expiresIn: '1h' },
		);

		res.status(200).json({ token, userId: user._id.toString() });
	},
	async getStatus(req, res) {
		const user = await User.findById(req.userId);

		if (!user) {
			throw error({ message: 'No user found', statusCode: 401 });
		}

		res.status(200).json({ message: 'User status', status: user.status });
	},
	async updateStatus(req, res) {
		const { status } = req.body;
		let user = await User.findById(req.userId);

		if (!user) {
			throw error({ message: 'No user found', statusCode: 401 });
		}

		console.log('status', status);

		user.status = status;

		user = await user.save();

		res.status(200).json({ message: 'User status updated', status });
	},
};
