const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { upload, processImage } = require('../middlewares/multer-config');
const bookCtrl = require('../controllers/library');
const uploadToCloudinary = require('../middlewares/cloudinary');
const moderateImage = require('../middlewares/moderation');


router.get('/', bookCtrl.getAllBooks);
router.post('/', auth, upload, processImage, moderateImage, uploadToCloudinary, bookCtrl.createBook);
router.get('/bestrating', bookCtrl.bestRating);
router.get('/:id', bookCtrl.getOneBook);
router.put('/:id', auth, upload, processImage, moderateImage, uploadToCloudinary, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.post('/:id/rating', auth, bookCtrl.createRating);

module.exports = router;