const mongoose = require('mongoose');
const financeModel = require('../models/finance');
const financeCashFlowModel = require('../models/financeCashFlow');
const financeCashFixModel = require('../models/financeCarFix');
const userModel = require('../models/user');
const mortgageTypeModel = require('../models/mortgageType');

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
            address: {
                address1: params.address1,
                address2: params.address2,
                postcode: params.postcode,
            }
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
    },

    addMortgageTypes: async (listOfMortgage) => {

        let mortgageList = [];

        for (let type in listOfMortgage) {
            let addMortgage = await new mortgageTypeModel({
                name: listOfMortgage[type]
            });

            await addMortgage.save();
            mortgageList.push(addMortgage);
        }

        return mortgageList;
        
    },

    getMortgageList: async () => {
        return mortgageTypeModel.find();
    },

    addCustomerCashFinance: async (params, customer) => {

        let customerFinance = await new financeCashFlowModel({
            dealerId: params.dealerId,
            customerId: customer._id,
            carId: params.carId,
            firstName: params.firstName,
            lastName: params.lastName,
            email: customer.email ? customer.email : params.email,
            category: 'Cash',
            contact: {
                countryCode: customer.contact.countryCode ? customer.contact.countryCode : params.countryCode,
                number: customer.contact.number ? customer.contact.number : params.number,
            },
            address: {
                address1: params.address.address1,
                address2: params.address.address2,
                city: params.address.city,
                postalCode: params.address.postalCode,
                province: params.address.province,
            },
            gender: params.gender,
            DOB: params.DOB,
            documents: params.documents,
            status: '',
            isTradeinCarAvilable: params.isTradeinCarAvilable,
            tradeDetails: {
                VIN: params.tradeDetails.VIN,
                YearMakeModel: params.tradeDetails.YearMakeModel,
                odometerReading: params.tradeDetails.odometerReading,
                trim: params.tradeDetails.trim,
                transmission: params.tradeDetails.transmission,
                color: params.tradeDetails.color,
                ownerShip: params.tradeDetails.ownerShip,
                loanType: params.tradeDetails.loanType,
                amount: params.tradeDetails.amount,
                remainingPayment: params.tradeDetails.remainingPayment,
                EMIAmount: params.tradeDetails.EMIAmount,
                accidentHistory: {
                    damageAmount: params.tradeDetails.damageAmount,
                    insurancePayoutAmount: params.tradeDetails.insurancePayoutAmount
                },
                mechanicalIssue: params.tradeDetails.mechanicalIssue,
                warningLight: params.tradeDetails.warningLight,
                afterMarketModification: params.tradeDetails.afterMarketModification,
                additionalIsuse: params.tradeDetails.additionalIsuse,
                estimatedBodyWorkAmount: params.tradeDetails.estimatedBodyWorkAmount,
                smoke: params.tradeDetails.smoke,
                photos: params.tradeDetails.photos,
            }
        });

        if (customerFinance) {
            return customerFinance.save();
        } else {
            return undefined;
        }
    },

    addCustomerFixFinance: async (params, customer) => {
        let customerFinance = await new financeCashFixModel({
            dealerId: params.dealerId,
            customerId: customer._id,
            carId: params.carId,
            firstName: params.firstName,
            lastName: params.lastName,
            email: customer.email ? customer.email : params.email,
            category: 'Fix',
            contact: {
                countryCode: customer.contact.countryCode ? customer.contact.countryCode : params.countryCode,
                number: customer.contact.number ? customer.contact.number : params.number,
            },
            address: {
                address1: params.address.address1,
                address2: params.address.address2,
                city: params.address.city,
                postalCode: params.address.postalCode,
                province: params.address.province,
            },
            status: 'CustomerRequestForFinanceFixCar',
            gender: params.gender,
            DOB: params.DOB,
            documents: {
                category: params.category,
                file: params.file,
            },
            status: params.status,
            tradeDetails: {
                VIN: params.tradeDetails.VIN,
                YearMakeModel: params.tradeDetails.YearMakeModel,
                odometerReading: params.tradeDetails.odometerReading,
                trim: params.tradeDetails.trim,
                transmission: params.tradeDetails.transmission,
                color: params.tradeDetails.color,
                ownerShip: params.tradeDetails.ownerShip,
                loanType: params.tradeDetails.loanType,
                amount: params.tradeDetails.amount,
                remainingPayment: params.tradeDetails.remainingPayment,
                EMIAmount: params.tradeDetails.EMIAmount,
                accidentHistory: {
                    damageAmount: params.tradeDetails.damageAmount,
                    insurancePayoutAmount: params.tradeDetails.insurancePayoutAmount
                },
                mechanicalIssue: params.tradeDetails.mechanicalIssue,
                warningLight: params.tradeDetails.warningLight,
                afterMarketModification: params.tradeDetails.afterMarketModification,
                additionalIsuse: params.tradeDetails.additionalIsuse,
                estimatedBodyWorkAmount: params.tradeDetails.estimatedBodyWorkAmount,
                smoke: params.tradeDetails.smoke,
                photos: params.tradeDetails.photos,
            },
            EMIOptions: params.EMIOptions,
        });

        if (customerFinance) {
            return customerFinance.save();
        } else {
            return undefined;
        }
    },

    getFinanceById: async (financeId, type) => {

        let finance;
        if (type == 'financeFix') {
            finance = await financeCashFixModel.findById(financeId);
        } else {
            finance = await financeCashFlowModel.findById(financeId);
        } 

        return finance;
    },

    editFinancePaidStatus: async (params) => {
        let update = {
            status: 'CustomerPaidFullInCash'
        }

        let updateFinanceStatus = await financeCashFlowModel.findByIdAndUpdate(params.financeId, update, { new: true });

        return updateFinanceStatus;
    },

    editFinanceStatus: async (params) => {
        let update = {
            status: params.status,
            appointments: params.appointments,
            billOfSale: params.billOfSale,
            additionalDocuments: params.additionalDocuments,
            deliveryDate: params.deliveryDate ? params.deliveryDate : undefined,
            selectedEMIOptions: params.selectedEMIOptions ? params.selectedEMIOptions : undefined,
            EMIOptions: params.EMIOptions ? params.EMIOptions : undefined,
            'tradeDetails.dealerEstimatedTradeValue': params.tradeInCarValue ? params.tradeInCarValue : params.dealerEstimatedTradeInValue
        }

        let updateFinanceStatus = await financeCashFlowModel.findByIdAndUpdate(params.financeId, update, { new: true });

        return updateFinanceStatus;
    },

    deleteFinanceOrder: async (financeId) => {
        await financeCashFixModel.findByIdAndDelete(financeId);

        return true;
    },

    getAllCustomerRequestedOrders: async (dealer) => {
        const cashOrders = await financeCashFixModel.find({
            $and: [
                { dealerId: dealer._id },
                { status: '' }
            ]  
        });

        const fixOrders = await financeCashFlowModel.find({
            $and: [
                { dealerId: dealer._id },
                { status: '' }
            ]
        });

        return [...cashOrders, ...fixOrders];
    }
}