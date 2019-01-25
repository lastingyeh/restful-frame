const express = require('express');
const { body } = require('express-validator/check');

const feedController = require('../controllers/feed');
const { withErrorHandler } = require('../utils/withErrorHandler');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/posts', isAuth, withErrorHandler(feedController.getPosts));

router.post(
	'/post',
	isAuth,
	[
		body('title')
			.trim()
			.isLength({ min: 5 }),
		body('content')
			.trim()
			.isLength({ min: 5 }),
	],
	withErrorHandler(feedController.createPost),
	// feedController.createPost
);

router
	.route('/post/:postId')
	.get(isAuth, withErrorHandler(feedController.getPost))
	.put(
		isAuth,
		[
			body('title')
				.trim()
				.isLength({ min: 5 }),
			body('content')
				.trim()
				.isLength({ min: 5 }),
		],
		withErrorHandler(feedController.updatePost),
	)
	.delete(isAuth, withErrorHandler(feedController.deletePost));

module.exports = router;
