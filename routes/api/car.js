const express = require('express');

const router = express.Router();

const carController = require('../../controllers/car');
const authController = require('../../middleware/auth');
const commonAuthController = require('../../middleware/commonAuth');
const dealerAuthController = require('../../middleware/dealerAuth');

router.get('/test', carController.searchCarInventory);
router.get('/dealer', carController.getFilteredDealerInventory);
router.put('/360/Image', carController.updateCar360ImageURL);

router.get('/search', commonAuthController, carController.searchCarInventory);

router.post('/category', carController.addCarType);
router.get('/category', carController.getVehicleCategories);

router.post('/', authController, carController.addNewCar);
router.get('/', authController, carController.getAllCars);
router.get('/:dealerId', authController, carController.getAllCars);
router.put('/', authController, carController.editCarDetails);
router.delete('/:dealerId', authController, carController.deleteCar);

router.post('/additional/services', carController.additionalCarServices);
router.get('/additional/services', carController.getAdditionalCarServices);
router.put('/additional/services', carController.addCarServicesToOrder);


module.exports = router;