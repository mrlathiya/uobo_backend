const dealerSchema = require('../models/dealer');
const dealerRating = require('../models/dealerRating');

module.exports = {
    addDealer: async (params) => {
        let newDealer = await new dealerSchema({
            name: params.name,
            logo: params.logo,
            location: {
                lat: params.lat !== undefined && params.lat !== "" && params.lat !== null ? Number(params.lat) : undefined,
                long: params.long !== undefined && params.long !== "" && params.long !== null ? Number(params.long) : undefined
            }
        });

        if (newDealer !== null) {
            console.log('inn')
            return newDealer.save();
        } else {
            return undefined;
        }
    },

    getDealerByDealerId: async (dealerId) => {
        let dealer = await dealerSchema.findById(dealerId);

        return dealer;
    },

    getAllDealers: async () => {
        const dealers = await dealerSchema.find();

        return dealers;
    },

    editDealerDetails: async (params) => {
        let update = {
            name: params.name,
            logo: params.logo,
            location: {
                lat: params.lat,
                long: params.long
            }
        };

        const updateDealer = await dealerSchema.findByIdAndUpdate(params.dealerId, update, { new: true });

        return updateDealer;
    },

    deleteDealer: async (dealerId) => {
        await dealerSchema.findByIdAndDelete(dealerId);

        return true;
    },

    addDealerRating: async (params) => {
        let addRating = await new dealerRating({
            dealerId: params.dealerId,
            finalRating: params.finalRating,
            communication: params.communication,
            service: params.service,
            vehicle: params.vehicle,
        });

        console.log(addRating);

        if(addRating !== undefined) {
            return addRating.save();
        } else {
            return undefined;
        }
    },

    getDealerRating: async (dealerId) => {
        let ratings = await dealerRating.find({ dealerId })
                                        .populate({
                                            path: 'dealerId'
                                        });

        return ratings;
    },

    getAllDealerRating: async (dealerId) => {
        let ratings = await dealerRating.find()
                                        .populate({
                                            path: 'dealerId'
                                        });

        return ratings;
    }
}