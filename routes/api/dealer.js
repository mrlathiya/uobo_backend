const express = require('express');

const router = express.Router();

const dealerController = require('../../controllers/dealer');
const dealerAuthController = require('../../middleware/dealerAuth');

//Dealers API
// router.post('/', authController, dealerController.addNewDealer);
router.post('/', dealerController.dealerRegistration);
router.post('/login', dealerController.dealerLogin);
router.get('/', dealerAuthController, dealerController.getDealer);
router.put('/', dealerAuthController, dealerController.updateDealer);
router.delete('/:id', dealerAuthController, dealerController.deleteDealer);

//Dealer Rating API
router.post('/rating', dealerAuthController, dealerController.addDealerRating);
router.get('/rating', dealerAuthController, dealerController.getDealerRatings);

module.exports = router;