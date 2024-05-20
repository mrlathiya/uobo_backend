const express = require('express');

const router = express.Router();

const carController = require('../../controllers/car');
const authController = require('../../middleware/auth');
const commonAuthController = require('../../middleware/commonAuth');
const dealerAuthController = require('../../middleware/dealerAuth');

router.get('/expense1', carController.testData1);
router.get('/expense2', carController.testData2);


router.get('/search', commonAuthController, carController.searchCarInventory);

router.post('/category', carController.addCarType);
router.get('/category', carController.getVehicleCategories);

router.post('/', authController, carController.addNewCar);
router.get('/', authController, carController.getAllCars);
router.get('/:dealerId', authController, carController.getAllCars);
router.put('/', authController, carController.editCarDetails);
router.delete('/:dealerId', authController, carController.deleteCar);


module.exports = router;