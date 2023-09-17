const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const acceptedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

const storage = multer.diskStorage({
  destination: 'tmp',
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (acceptedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
