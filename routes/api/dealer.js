const express = require('express');
const multer = require('multer');

const router = express.Router();

// Set up multer storage
const storage = multer.memoryStorage();
const uploadFile = multer({ storage: storage });

const dealerController = require('../../controllers/dealer');
const dealerAuthController = require('../../middleware/dealerAuth');
const authController = require('../../middleware/auth');

//Dealers API
// router.post('/', authController, dealerController.addNewDealer);
router.post('/', uploadFile.single('inventory_csv'), dealerController.dealerRegistration);
router.post('/login', dealerController.dealerLogin);
router.get('/', dealerAuthController, dealerController.getDealer);
router.get('/all', dealerController.getAlldealerDetails);
router.put('/', dealerAuthController, dealerController.updateDealer);

router.delete('/stripe-account', dealerAuthController, dealerController.deleteDealerStripeAccount);
router.delete('/:id', dealerAuthController, dealerController.deleteDealer);

//Dealer Rating API
router.post('/rating', authController, dealerController.addDealerRating);
router.get('/rating', dealerAuthController, dealerController.getDealerRatings);


module.exports = router;