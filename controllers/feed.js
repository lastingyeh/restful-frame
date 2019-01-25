const { validationResult } = require('express-validator/check');

const Post = require('../models/post');
const User = require('../models/user');
const clearImage = require('../utils/clearImage');
const { error } = require('../utils/withErrorHandler');

module.exports = {
	//* '/feed/posts'
	async getPosts(req, res) {
		const currentPage = req.query.page || 1;
		const perPage = 2;

		const totalItems = await Post.countDocuments();
		const posts = await Post.find()
			.skip((currentPage - 1) * perPage)
			.limit(perPage);

		console.log('posts', posts);

		res.status(200).json({ message: 'Fetched posts', posts, totalItems });
	},
	//* '/feed/post'
	async createPost(req, res) {
		// check body
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			throw error(
				{
					message: 'Validation failed, entered data is incorrect.',
					statusCode: 422,
				},
				errors.array(),
			);
		}

		if (!req.file) {
			throw error({
				message: 'No image file provided.',
				statusCode: 422,
			});
		}

		const { title, content } = req.body;
		const imageUrl = req.file.path;
		const userId = req.userId;

		// check user exist
		const user = await User.findById(userId);

		if (!user) {
			throw error({ message: 'user not exist', statusCode: 404 });
		}

		const post = await new Post({
			title,
			content,
			imageUrl,
			creator: userId,
		}).save();

		user.posts.push(post);
		await user.save();

		res.status(201).json({
			message: 'Post created successfully!',
			post,
			creator: { _id: user._id, name: user.name },
		});
	},
	//* '/feed/post/:postId'
	async getPost(req, res) {
		const postId = req.params.postId;

		const post = await Post.findById(postId);

		if (!post) {
			throw error({ message: `post: ${postId} not found`, statusCode: 404 });
		}

		res.status(200).json({ message: 'Post fetched.', post });
	},
	//* '/feed/post/:postId'
	async updatePost(req, res) {
		const postId = req.params.postId;
		const { title, content } = req.body;

		let imageUrl = req.body.image;

		if (req.file) {
			imageUrl = req.file.path;
		}

		if (!imageUrl) {
			throw error({
				message: 'No image file provided.',
				statusCode: 422,
			});
		}

		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			throw error(
				{
					message: `Validation failed, entered data is incorrect.`,
					statusCode: 422,
				},
				errors.array(),
			);
		}

		let post = await Post.findById(postId);

		if (!post) {
			throw error({ message: `post: ${postId} not found`, statusCode: 404 });
		}

		if (post.creator.toString() !== req.userId) {
			throw error({ message: 'Not authenticated', statusCode: 403 });
		}

		post.title = title;
		post.content = content;
		post.imageUrl = imageUrl;

		post = await post.save();

		// delete old image
		clearImage(imageUrl);

		res.status(200).json({ message: 'Update fetched.', post });
	},
	async deletePost(req, res) {
		const postId = req.params.postId;

		const post = await Post.findById(postId);

		if (post.creator.toString() !== req.userId) {
			throw error({ message: 'Not authenticated', statusCode: 403 });
		}

		// check user exist
		const user = await User.findById(req.userId);

		if (!user) {
			throw error({ message: 'user not exist', statusCode: 404 });
		}

		user.posts.pull(postId);

		await post.remove();
		await user.save();

		clearImage(post.imageUrl);

		res.status(200).json({ message: 'Deleted post.' });
	},
};
