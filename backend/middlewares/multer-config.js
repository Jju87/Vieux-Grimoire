const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

// On définie les types d'images acceptés
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// On défini la destination du stockage et le nom du fichier
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    //Grace à split on retire les espaces et on les remplace par des _ 
    const name = file.originalname.split(' ').join('_').split('.')[0];
    // On renomme le fichier avec un timestamp et on ajoute l'extension .webp
    callback(null, `${name}${Date.now()}.webp`);
  },
});

// Single permet de dire qu'il s'agit d'un fichier unique
const upload = multer({ storage: storage }).single('image');

// Unlink permet de supprimer l'image située sur le path donné
const deleteImg = (filePath) => {
  fs.unlink(filePath, (error) => {
    if (error) {
      console.error(error);
    } else {
      console.log('File deleted successfully!');
    }
  });
};

// On utilise sharp pour redimensionner l'image
const process = (req, res, next) => {
    console.log(req.file); // Log the file object
  
    if (!req.file) {
      return next();
    }
  
    sharp.cache(false);
  
    // Resize and compress image
    sharp(req.file.path)
    .rotate()
    .resize({fit: 'inside'})
    .webp(85)
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

module.exports = { upload, process };