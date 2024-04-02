const express = require('express');
const router = express.Router();

const libraryCtrl = require('../controllers/library');
const auth = require('../middlewares/auth');

//Routes qui ne requièrent pas d'authentificatiolibraryCtrl
router.get('/',libraryCtrl.getAllBooks);
router.get('/:id', libraryCtrl.getOneBook);
// router.get('/bestrating', libraryCtrl.bestRating);

//Routes qui requièrent une authentification
router.post('/', auth, libraryCtrl.createBook);
router.put('/:id', auth, libraryCtrl.modifyBook);
router.delete('/:id',auth, libraryCtrl.deleteBook);
// router.post('/:id/ratings', auth, libraryCtrl.createRating);

module.exports = router;