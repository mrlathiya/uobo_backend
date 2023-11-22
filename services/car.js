const carSchema = require('../models/car');

module.exports = {
    addNewCar: async (params) => {
        let addCar = await new carSchema({
            model: params.model,
            make: params.make,
            year: params.year,
            trim: params.trim,
            location: params.location,
            mileage: params.mileage,
            pricing: params.pricing,
            decription: params.decription,
            feature: params.feature
        });

        if (addCar) {
            return addCar.save();
        } else {
            return false;
        }
    },

    getAllCars: async () => {
        let cars = await carSchema.find();

        return cars;
    },

    getCarById: async (carId) => {
        let car = await carSchema.findById(carId);

        return car;
    },

    editCarDetails: async (params) => {
        let update = {
            model: params.model,
            make: params.make,
            year: params.year,
            trim: params.trim,
            location: params.location,
            mileage: params.mileage,
            pricing: params.pricing,
            decription: params.decription,
            feature: params.feature
        }

        let updateCar = await carSchema.findByIdAndUpdate(params.carId, update, { new: true });
        
        return updateCar;
    }
};