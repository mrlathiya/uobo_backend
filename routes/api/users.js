const express = require('express');

const router = express.Router();

const userController = require('../../controllers/user');
const authController = require('../../middleware/auth');
const financeController = require('../../controllers/finance');
const financeService = require('../../services/finance');

router.get('/order-event-stream', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const dealerId = req.query.dealerId;
    let params = { _id: dealerId };

    // Send initial notification data
    res.write(`data: ${JSON.stringify({ message: 'Connected' })}\n\n`);

    const intervalId = setInterval(async () => {
        try {
            let orderData = await financeService.getOrderByDealerIdV1(params);
            const message = { type: 'ORDER_NOTIFICATION', data: orderData, count: orderData.length };
            res.write(`data: ${JSON.stringify(message)}\n\n`);
        } catch (error) {
            console.error('Error fetching order data:', error);
            res.write(`data: ${JSON.stringify({ type: 'ERROR', message: 'Failed to fetch order data' })}\n\n`);
        }
    }, 10000); // Send every 10 seconds

    req.on('close', () => {
        console.log('Client closed the connection');
        clearInterval(intervalId); // Clear the interval when the connection closes
        res.end();
    });
});


router.get('/noti', userController.sendNoti);
router.post('/payment-alert', userController.sendAlertForPaymentProcessCompletion);
router.get('/notification', userController.getUserNotifications);
router.put('/licenceVerification', userController.editCustomerLicenceVerification);
router.post('/sendOTP', userController.generateOTP);
router.post('/verifyOTP', userController.customerOTPVerification);

router.post('/', userController.userRegistration);
router.get('/all', userController.getAllUsers);
router.get('/', userController.signInUser);
// router.get('/:id', userController.getUser);
router.post('/pave', userController.listenToPaveEvent);

// router.post('/stripe-payment', userController.createStripePayment);
router.post('/transfer-stripe-payment', userController.transferStripePayment);

router.post('/promocode', userController.addCustomerPromocode);
router.get('/promocode', userController.getCustomerPromocode);
router.put('/active/promocode', userController.activePromocode);

router.post('/preference', authController, userController.addUserPreferences);
router.get('/preference', authController, userController.getUserPreference);

router.put('/', authController, userController.editUserProfile);
router.post('/dlVerification', authController, userController.userVerification);
router.patch('/location', authController, userController.updateUserLocation);
router.post('/email', userController.collectUserEmail);
router.delete('/', userController.deleteCustomer);

router.put('/promocode', authController, userController.editCustomerPromocode);


module.exports = router;