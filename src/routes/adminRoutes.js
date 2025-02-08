const express = require('express');
const userController = require('../controllers/userController');
const reservationController = require('../controllers/reservationController');

const router = express.Router();

router.get('/users', userController.getAllUsers);
router.get('/reservations', reservationController.getAllReservations);
router.delete('/delete-user/:id', userController.deleteUser);
router.get('/get-user/:id', userController.getUserById);

module.exports = router;
