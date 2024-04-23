const multer = require('multer');
const sharp = require('sharp');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

require('dotenv').config({ path: 'backend/.env' });

const CloudinaryName = process.env.CLOUD_NAME;
const CloudinaryKey = process.env.API_KEY;
const CloudinaryApiSecret = process.env.API_SECRET;

cloudinary.config({
  cloud_name: CloudinaryName,
  api_key: CloudinaryKey,
  api_secret: CloudinaryApiSecret,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vieux_grimoire_images',
    format: async (req, file) => 'webp', // supports promises as well
    public_id: (req, file) => file.filename,
  },
});

const upload = multer({ storage: storage }).single('image');

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