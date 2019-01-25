const express = require('express');
const { body } = require('express-validator/check');

const User = require('../models/user');
const authController = require('../controllers/auth');
const { withErrorHandler } = require('../utils/withErrorHandler');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.put(
	'/signup',
	[
		body('email')
			.isEmail()
			.withMessage('Please enter a valid email.')
			.custom(async (email, { req }) => {
				const user = await User.findOne({ email });

				if (user) {
					throw new Error('Email already exists.');
				}
			})
			.normalizeEmail(),
		body('password')
			.trim()
			.isLength({ min: 5 }),
		body('name')
			.trim()
			.not()
			.isEmpty(),
	],
	withErrorHandler(authController.signup),
);

router.post('/login', withErrorHandler(authController.login));

router
	.route('/status')
	.get(isAuth, withErrorHandler(authController.getStatus))
	.put(
		isAuth,
		[
			body('status')
				.trim()
				.not()
				.isEmpty()
				.isLength({ min: 3, max: 10 }),
		],
		withErrorHandler(authController.updateStatus),
	);

module.exports = router;
