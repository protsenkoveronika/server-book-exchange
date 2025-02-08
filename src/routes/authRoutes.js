const express = require('express');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.put('/update-profile', authenticate, authController.updateProfile);
router.put('/update-user', authenticate, authController.updateUser);
router.post('/check-email-exists', authController.checkEmailExists);
router.post('/check-username-exists', authController.checkUsernameExists);

module.exports = router;
