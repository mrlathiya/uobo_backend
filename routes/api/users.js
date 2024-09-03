const express = require('express');

const router = express.Router();

const userController = require('../../controllers/user');
const authController = require('../../middleware/auth');
const financeController = require('../../controllers/finance');
const financeService = require('../../services/finance');

// router.get('/noti', async (req, res) => {
//     res.setHeader('Content-Type', 'text/event-stream');
//     res.setHeader('Cache-Control', 'no-cache');
//     res.setHeader('Connection', 'keep-alive');
//     res.flushHeaders();

//     const dealerId = req.body.dealerId;
//     let params = {
//         _id: dealerId
//     }
  
//     // Send initial notification data
//     res.write(`data: ${JSON.stringify({ message: 'Connected' })}\n\n`);
  
//     setInterval(async () => {
//         let orderData = await financeService.getOrderByDealerId(params);
//         const message = { type: 'ORDER_NOTIFICATION', data: orderData, count: orderData.length };
//         res.write(`data: ${JSON.stringify(message)}\n\n`);
//     }, 10000); // Send every 10 seconds

//     req.on('close', () => {
//         console.log('Client closed the connection');
//         res.end();
//     });
// });

// router.get('/noti', userController.sendNoti);
router.post('/payment-alert', userController.sendAlertForPaymentProcessCompletion);
router.get('/notification', userController.getUserNotifications);
router.put('/licenceVerification', userController.editCustomerLicenceVerification);

router.post('/', userController.userRegistration);
router.get('/all', userController.getAllUsers);
router.get('/', userController.signInUser);
router.get('/:id', userController.getUser);
router.post('/pave', userController.listenToPaveEvent);

router.post('/stripe-payment', userController.createStripePayment);
router.post('/transfer-stripe-payment', userController.transferStripePayment);

router.put('/', authController, userController.editUserProfile);
router.post('/dlVerification', authController, userController.userVerification);
router.patch('/location', authController, userController.updateUserLocation);
router.post('/email', userController.collectUserEmail);





module.exports = router;