const express = require('express');
const multer = require('multer');

const router = express.Router();

// Set up multer storage
const storage = multer.memoryStorage();
const uploadFile = multer({ 
    storage: storage,
    limits: {
        fieldSize: 25 * 1024 * 1024,
    },
});

const dealerController = require('../../controllers/dealer');
const dealerAuthController = require('../../middleware/dealerAuth');
const authController = require('../../middleware/auth');

router.post('/', uploadFile.single('inventory_csv'), dealerController.dealerRegistration);
router.post('/login', dealerController.dealerLogin);
router.put('/fcmToken', dealerController.editDealerFcmToken);

router.post('/docusign-webhooks', dealerController.getDocusignContent);
router.delete('/clean-data', dealerController.deleteUnrelatedData);
router.patch('/remove-inventory-image', dealerController.removeImageFromInventory);
router.patch('/edit-inventory', dealerController.editInventory);
router.get('/inventory', dealerController.getAllDealerInventory);
router.get('/all', dealerController.getAlldealerDetails);

router.post('/sendOTP', dealerController.generateOTP);
router.post('/verifyOTP', dealerController.dealerOTPVerification);

router.get('/', dealerAuthController, dealerController.getDealer);
router.put('/', dealerAuthController, dealerController.updateDealer);
router.delete('/stripe-account', dealerAuthController, dealerController.deleteDealerStripeAccount);
router.delete('/:id', dealerAuthController, dealerController.deleteDealer);
router.get('/notification', dealerAuthController, dealerController.getDashboardDealerNotifications);
router.put('/notification', dealerAuthController, dealerController.markAsReadNotification);
router.get('/check-token', dealerAuthController, dealerController.checkToken);

//Dealer Rating API
router.post('/rating', authController, dealerController.addDealerRating);
router.get('/rating', dealerAuthController, dealerController.getDealerRatings);

router.post('/stripe-onboarding', dealerController.createDealerStripeConnectedAccount);
router.get('/stripe-onboarding', dealerAuthController, dealerController.getDealerStripeDetails);
router.get('/retrive-stripe-account', dealerAuthController, dealerController.retriveDealerStripeAccount);

router.put('/update-inventory', uploadFile.single('inventory_csv'), dealerController.updateDealerInventory);
router.put('/update-autotrade-inventory', uploadFile.single('inventory_csv'), dealerController.updateAutoTradeInventory);
router.put('/update-londonAutoValley-inventory', uploadFile.single('inventory_csv'), dealerController.updateLondonAutoValleyInventory);



module.exports = router;