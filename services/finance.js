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
        const finance = await financeModel.findOne({userId})
                                          .populate({
                                            path: 'userId'
                                          });

        return finance;
    }
}