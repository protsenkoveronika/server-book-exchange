const express = require('express');
const bookController = require('../controllers/bookController');
const multer = require('multer');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  }),
});

router.get('/all', bookController.getAllBooks);
router.get('/reservations', authenticate, bookController.getUserReservations);
router.get('/my-books', authenticate, bookController.getUserBooks);
router.get('/:id', bookController.getBookDetails);
router.post('/new', authenticate, upload.single('photo'), bookController.createBook);
router.put('/upload/:id', authenticate, upload.single('photo'), bookController.updateBook);
router.delete('/delete/:id', authenticate, bookController.deleteBook);

module.exports = router;
