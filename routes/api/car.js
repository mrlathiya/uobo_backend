const express = require('express');

const router = express.Router();

const carController = require('../../controllers/car');
const authController = require('../../middleware/auth');

router.post('/', authController, carController.addNewCar);
router.get('/', authController, carController.getAllCars);
router.get('/:dealerId', authController, carController.getAllCars);
router.put('/', authController, carController.editCarDetails);
router.delete('/', authController, carController.deleteCar);

module.exports = router;