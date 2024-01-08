const mongoose = require('mongoose');
const financeModel = require('../models/finance');
const userModel = require('../models/user');

module.exports = {
    addCustomerFinance: async (params) => {
        const customerFinance = await new financeModel({
            carType: params.carType,
            preference: params.preference,
            make: params.make,
            model: params.model,
            priceRange: {
                start: Number(params.priceRange.start),
                end: Number(params.priceRange.end)
            },
            yearRange: {
                start: Number(params.yearRange.start),
                end: Number(params.yearRange.end)
            },
            mileageRange: {
                start: Number(params.mileageRange.start),
                end: Number(params.mileageRange.end)
            },
            driveTrain: params.driveTrain,
            transmission: params.transmission,
            colors: params.colors,
            userId: params.userId
        });

        if (customerFinance !== null && customerFinance !== undefined) {
            return customerFinance.save();
        } else {
            return undefined;
        }
    },

    editUserFinanceDetails: async (params) => {
        const editInformation = {
            houseOwnership: params.houseOwnership,
            currentEmployment: params.currentEmployment,
            grossIncome: params.grossIncome,
            otherIncomeSource: params.otherIncomeSource,
            SIN: params.SIN,
            documents: params.documents,
            preferredDeliveryMode: params.preferredDeliveryMode,
        }

        let editUser = await userModel.findByIdAndUpdate(params.userId, editInformation, { new: true });

        return editUser;
    },

    getUserFinanceDetails: async (userId) => {

        let id = new mongoose.Types.ObjectId(userId);

        const finance = await financeModel.aggregate([
            {
                $match: {
                    userId: id
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'customerInfo'
                }
            },
            {
                $unwind: '$customerInfo'
            },
            {
                $project: {
                    _id: 1,
                    carType: '$carType',
                    preference: '$preference',
                    make: '$make',
                    model: '$model',
                    priceRange: '$priceRange',
                    yearRange: '$yearRange',
                    mileageRange: '$mileageRange',
                    driveTrain: '$driveTrain',
                    transmission: '$transmission',
                    colors: '$colors',
                    userId: '$userId',
                    'customerInfo._id': 1,
                    'customerInfo.firstName': 1,
                    'customerInfo.lastName': 1,
                    'customerInfo.middleName': 1,
                    'customerInfo.preferName': 1,
                    'customerInfo.email': 1,
                    'customerInfo.contact': 1,
                    currentEmployment: '$customerInfo.currentEmployment',
                    currentLocation: '$customerInfo.currentLocation',
                    SIN: '$customerInfo.SIN',
                    documents: '$customerInfo.documents',
                    grossIncome: '$customerInfo.grossIncome',
                    houseOwnership: '$customerInfo.houseOwnership',
                    otherIncomeSource: '$customerInfo.otherIncomeSource',
                    preferredDeliveryMode: '$customerInfo.preferredDeliveryMode'
                }
              }
        ])

        return finance;
    }
}