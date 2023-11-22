const express = require('express');

const router = express.Router();

const userController = require('../../controllers/user');
const authController = require('../../middleware/auth');

router.post('/', userController.userRegistration);
router.get('/', userController.signInUser);
router.put('/', authController, userController.editUserProfile);
router.get('/all', userController.getAllUsers);

module.exports = router;