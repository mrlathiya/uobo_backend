const express = require('express');

const router = express.Router();

const userController = require('../../controllers/user');
const authController = require('../../middleware/auth');

router.post('/', userController.userRegistration);
router.get('/', userController.signInUser);
router.get('/:id', userController.getUser);
router.put('/', authController, userController.editUserProfile);
router.get('/all', userController.getAllUsers);
router.post('/dlVerification', authController, userController.userVerification);
router.patch('/location', authController, userController.updateUserLocation);

module.exports = router;