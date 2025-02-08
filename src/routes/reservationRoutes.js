const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authenticate = require('../middleware/authenticate');

router.post('/reserve/:bookId', authenticate, reservationController.reserveBook);
router.get('/get-reservation/:bookId', authenticate, reservationController.getBookReservation);

module.exports = router;
