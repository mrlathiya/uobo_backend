const express = require('express');

const router = express.Router();

const userController = require('../../controllers/user');
const authController = require('../../middleware/auth');

router.get('/noti', userController.sendNoti);
router.post('/payment-alert', userController.sendAlertForPaymentProcessCompletion);

router.post('/', userController.userRegistration);
router.get('/all', userController.getAllUsers);
router.get('/', userController.signInUser);
router.get('/:id', userController.getUser);
router.put('/', authController, userController.editUserProfile);
router.post('/dlVerification', authController, userController.userVerification);
router.patch('/location', authController, userController.updateUserLocation);
router.post('/email', authController, userController.collectUserEmail);
router.post('/stripe-payment', userController.createStripePayment);
router.post('/transfer-stripe-payment', userController.transferStripePayment);


module.exports = router;