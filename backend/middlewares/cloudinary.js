const { v2: cloudinary } = require('cloudinary');
require('dotenv').config({ path: 'backend/.env' });

const CloudinaryName = process.env.CLOUD_NAME;
const CloudinaryKey = process.env.API_KEY;
const CloudinaryApiSecret = process.env.API_SECRET;

cloudinary.config({
  cloud_name: CloudinaryName,
  api_key: CloudinaryKey,
  api_secret: CloudinaryApiSecret,
});

const uploadToCloudinary = (req, res, next) => {
  const file = req.file;
  const imageContent = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

  cloudinary.uploader.upload(imageContent, 
    { resource_type: "auto", folder: 'vieux_grimoire_images', public_id: file.originalname.split(".")[0], format: 'webp' },
    function(error, result) {
      if (error) {
        console.log('Upload error: ', error);
        res.status(500).json({ error: error });
      } else {
        console.log('File uploaded to Cloudinary');
        req.body.imageUrl = result.secure_url;
        req.body.imagePublicId = result.public_id; // Add the image public ID to req.body
        next();
      }
    }
  );
};

module.exports = uploadToCloudinary;