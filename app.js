const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const uploadHandler = require('./utils/uploadHandler');

const app = express();

// app.use(bodyParser.urlencoded({ extended: true }));
//* limit incoming data for json format
app.use(bodyParser.json());
app.use(uploadHandler('image'));

app.use('/images', express.static(path.join(__dirname, 'images')));

// CORS allow
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Methods',
		'OPTIONS, GET, POST, PUT, PATCH, DELETE',
	);
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

	next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((req, res, next) => {
	const error = new Error('Not found');

	error.status = 404;

	next(error);
});

app.use((error, req, res, next) => {
	const status = error.statusCode || 500;
	const message = error.message;
	const data = error.data;

	res.status(status).json({ message, data });
});

mongoose
	.connect('mongodbUrlString')
	.then(() => {
		console.log('db is connecting');
		app.listen(8080);
	})
	.catch(err => console.log('db connection error', err));
