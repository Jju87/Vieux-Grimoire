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
    console.log(req.file); 
  
    if (!req.file) {
      return next();
    }
    // Empecher sharp de mettre en cache les images
    sharp.cache(false);
  
    // Sharp permet de redimensionner l'image, de la tourner dans le bon sens, de la convertir en webp et de la compresser
    sharp(req.file.path)
    .rotate()
    .resize({fit: 'inside'})
    .webp(85)
    // On enregistre l'image redimensionnée dans le dossier images avec le nom resized_nomdufichier
    // car one ne peut pas enregistrer l'image redimensionnée dans le même dossier que l'image d'origine ('images')
      .toFile('images/resized_' + req.file.filename, (err, info) => {
        if (err) {
          console.error(err);
          return next(err);
        }
  
        // On fait à nouveau appel à la fonction deleteImg pour supprimer l'image d'origine
        deleteImg(req.file.path);
        next();
      });
  };

module.exports = { upload, process };