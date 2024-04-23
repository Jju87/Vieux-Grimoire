const multer = require('multer');
const sharp = require('sharp');

// Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() }).single('image');

const processImage = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  sharp.cache(false);

  sharp(req.file.buffer)
    .rotate()
    .resize({ fit: 'inside' })
    .webp({ quality: 85 })
    .toBuffer()
    .then(data => {
      req.file.buffer = data;
      next();
    })
    .catch(err => {
      console.error(err);
      return next(err);
    });
};

module.exports = { upload, processImage };