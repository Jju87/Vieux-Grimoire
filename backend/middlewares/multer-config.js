const multer = require('multer');

// dictionnaire des types MIME pour définir le format de l'image 
// que le frontend peut envoyer
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};
// configuration de multer pour dire où enregistrer les fichiers et comment les nommer
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    // on appelle le callback, on passe null pour dire qu'il n'y a pas d'erreur
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    // on remplace les espaces par des underscores dans le nom du fichier
    const name = file.originalname.split(' ').join('_');
    // on génère l'extension du fichier
    const extension = MIME_TYPES[file.mimetype];
    // on appelle le callback, on passe null pour dire qu'il n'y a pas d'erreur
    callback(null, name + Date.now() + '.' + extension);
  }
});

// Exportation de multer configuré avec notre objet storage et lui passons la méthode single pour dire que c'est un fichier unique
// on précise que le fichier est une image
module.exports = multer({storage: storage}).single('image');