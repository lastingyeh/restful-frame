const multer = require('multer');

module.exports = image =>
	multer({
		storage: multer.diskStorage({
			destination: (req, file, cb) => {
				cb(null, 'images');
			},
			filename: (req, file, cb) => {
				cb(null, new Date().toISOString() + '-' + file.originalname);
			},
		}),
		fileFilter: (req, file, cb) => {
			if (file.mimetype.match(/^image\/(png|jpe?g)$/)) {
				cb(null, true);
			} else {
				cb(null, false);
			}
		},
	}).single(image);
