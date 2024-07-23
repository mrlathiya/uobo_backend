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

//Dealers API
// router.post('/', authController, dealerController.addNewDealer);


router.post('/', uploadFile.single('inventory_csv'), dealerController.dealerRegistration);
router.post('/login', dealerController.dealerLogin);
router.put('/fcmToken', dealerController.editDealerFcmToken);

router.post('/docusign-webhooks', dealerController.getDocusignContent);

router.get('/', dealerAuthController, dealerController.getDealer);
router.get('/all', dealerController.getAlldealerDetails);
router.put('/', dealerAuthController, dealerController.updateDealer);
router.delete('/:id', dealerAuthController, dealerController.deleteDealer);
router.get('/notification', dealerAuthController, dealerController.getDashboardDealerNotifications);

//Dealer Rating API
router.post('/rating', authController, dealerController.addDealerRating);
router.get('/rating', dealerAuthController, dealerController.getDealerRatings);
router.get('/stripe-onboarding', dealerAuthController, dealerController.getDealerRatings);


module.exports = router;