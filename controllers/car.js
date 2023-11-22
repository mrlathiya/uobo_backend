const carServices = require('../services/car');

module.exports = {
    addNewCar: async (req, res, next) => {
        try {
            let params = req.body;

            let addCar = await carServices.addNewCar(params);

            if (addCar) {
                return res.status(200).json({ IsSuccess: true, Data: [addCar], Message: 'Car added' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Car not added' });
            }

        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    getAllCars: async (req, res, next) => {
        try {
            let cars = await carServices.getAllCars();

            if (cars.length) {
                return res.status(200).json({ IsSuccess: true, Count: cars.length, Data: cars, Message: 'Cars found' });
            } else {
                return res.status(400).json({ IsSuccess: true, Data: [], Message: 'Cars not found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    getCar: async (req, res, next) => {
        try {
            const carId = req.params.id
            let carDetails = await carServices.getCarById(carId);

            if (carDetails) {
                return res.status(200).json({ IsSuccess: true, Data: [carDetails], Message: 'Car data found' });
            } else {
                return res.status(400).json({ IsSuccess: true, Data: [], Message: 'Car not found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    editCarDetails: async (req, res, next) => {
        try {
            const params = req.body;

            if (!params.carId) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please required car id parameter' });
            }

            let updateCarDetails = await carServices.editCarDetails(params);

            if (updateCarDetails) {
                return res.status(200).json({ IsSuccess: true, Data: updateCarDetails, Message: 'Car details updated' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Car details not updated' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    deleteCar: async (req, res, next) => {
        try {
            
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },
}