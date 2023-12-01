const express = require('express');

const router = express.Router();

const dealerController = require('../../controllers/dealer');
const authController = require('../../middleware/auth');

//Dealers API
router.post('/', authController, dealerController.addNewDealer);
router.get('/', authController, dealerController.getDealer);
router.put('/', authController, dealerController.updateDealer);
router.delete('/:id', authController, dealerController.deleteDealer);

//Dealer Rating API
router.post('/rating', authController, dealerController.addDealerRating);
router.get('/rating', authController, dealerController.getDealerRatings);

module.exports = router;