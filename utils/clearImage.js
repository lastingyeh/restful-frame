const path = require('path');
const fs = require('fs');

module.exports = filePath => {
	fs.unlink(
		path.join(__dirname, '..', filePath),
		err => err && console.log('delete image error %s', err),
	);
};
