const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_').split('.')[0];
    callback(null, `${name}${Date.now()}.webp`);
  },
});

// Use multer to download image
const upload = multer({ storage: storage }).single('image');

const deleteImg = (filePath) => {
  fs.unlink(filePath, (error) => {
    if (error) {
      console.error(error);
    } else {
      console.log('File deleted successfully!');
    }
  });
};

// Add middleware for traitment after download
const processImage = (req, res, next) => {
    console.log(req.file); // Log the file object
  
    if (!req.file) {
      return next();
    }
  
    sharp.cache(false);
  
    // Resize and compress image
    sharp(req.file.path)
    .rotate()
    .resize({ width: null, height: 500, fit: 'cover', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .webp()
      .toFile('images/resized_' + req.file.filename, (err, info) => {
        if (err) {
          console.error(err); // Log any errors from sharp
          return next(err);
        }
  
        // Remove initial image
        deleteImg(req.file.path);
        next();
      });
  };

module.exports = { upload, processImage };