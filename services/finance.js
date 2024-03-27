const mongoose = require('mongoose');
const financeModel = require('../models/finance');
const financeCashFlowModel = require('../models/financeCashFlow');
const financeCarFixModel = require('../models/financeCarFix');
const financeWithoutCar = require('../models/financeWithoutCar');
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

        let tradeDetails = {};

        if (params.tradeDetails) {
            tradeDetails.VIN = params.tradeDetails.VIN ? params.tradeDetails.VIN : '';
            tradeDetails.YearMakeModel = params.tradeDetails.YearMakeModel;
            tradeDetails.odometerReading = params.tradeDetails.odometerReading;
            tradeDetails.trim = params.tradeDetails.trim;
            tradeDetails.transmission = params.tradeDetails.transmission;
            tradeDetails.color = params.tradeDetails.color;
            tradeDetails.ownerShip = params.tradeDetails.ownerShip;
            tradeDetails.loanType = params.tradeDetails.loanType;
            tradeDetails.amount = params.tradeDetails.amount;
            tradeDetails.remainingPayment = params.tradeDetails.remainingPayment;
            tradeDetails.EMIAmount = params.tradeDetails.EMIAmount;
            tradeDetails.accidentHistory = {
                damageAmount: params.tradeDetails.damageAmount,
                insurancePayoutAmount: params.tradeDetails.insurancePayoutAmount
            };
            tradeDetails.mechanicalIssue = params.tradeDetails.mechanicalIssue;
            tradeDetails.warningLight = params.tradeDetails.warningLight;
            tradeDetails.afterMarketModification = params.tradeDetails.afterMarketModification;
            tradeDetails.additionalIsuse = params.tradeDetails.additionalIsuse;
            tradeDetails.estimatedBodyWorkAmount = params.tradeDetails.estimatedBodyWorkAmount;
            tradeDetails.smoke = params.tradeDetails.smoke;
            tradeDetails.photos = params.tradeDetails.photos;
        }

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
            tradeDetails: tradeDetails
        });

        if (customerFinance) {
            return customerFinance.save();
        } else {
            return undefined;
        }
    },

    addCustomerFixFinance: async (params, customer) => {
        let tradeDetails = {};

        if (params.tradeDetails) {
            tradeDetails.VIN = params.tradeDetails.VIN ? params.tradeDetails.VIN : '';
            tradeDetails.YearMakeModel = params.tradeDetails.YearMakeModel;
            tradeDetails.odometerReading = params.tradeDetails.odometerReading;
            tradeDetails.trim = params.tradeDetails.trim;
            tradeDetails.transmission = params.tradeDetails.transmission;
            tradeDetails.color = params.tradeDetails.color;
            tradeDetails.ownerShip = params.tradeDetails.ownerShip;
            tradeDetails.loanType = params.tradeDetails.loanType;
            tradeDetails.amount = params.tradeDetails.amount;
            tradeDetails.remainingPayment = params.tradeDetails.remainingPayment;
            tradeDetails.EMIAmount = params.tradeDetails.EMIAmount;
            tradeDetails.accidentHistory = {
                damageAmount: params.tradeDetails.damageAmount,
                insurancePayoutAmount: params.tradeDetails.insurancePayoutAmount
            };
            tradeDetails.mechanicalIssue = params.tradeDetails.mechanicalIssue;
            tradeDetails.warningLight = params.tradeDetails.warningLight;
            tradeDetails.afterMarketModification = params.tradeDetails.afterMarketModification;
            tradeDetails.additionalIsuse = params.tradeDetails.additionalIsuse;
            tradeDetails.estimatedBodyWorkAmount = params.tradeDetails.estimatedBodyWorkAmount;
            tradeDetails.smoke = params.tradeDetails.smoke;
            tradeDetails.photos = params.tradeDetails.photos;
        }

        let customerFinance = await new financeCarFixModel({
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
            status: '',
            gender: params.gender,
            DOB: params.DOB,
            isTradeinCarAvilable: params.isTradeinCarAvilable,
            documents: documents,
            status: params.status,
            tradeDetails: tradeDetails,
            EMIOptions: params.EMIOptions,
        });

        if (customerFinance) {
            return customerFinance.save();
        } else {
            return undefined;
        }
    },

    addWithoutCarOrder: async (params, customer) => {
        let tradeDetails = {};

        if (params.tradeDetails) {
            tradeDetails.VIN = params.tradeDetails.VIN ? params.tradeDetails.VIN : '';
            tradeDetails.YearMakeModel = params.tradeDetails.YearMakeModel;
            tradeDetails.odometerReading = params.tradeDetails.odometerReading;
            tradeDetails.trim = params.tradeDetails.trim;
            tradeDetails.transmission = params.tradeDetails.transmission;
            tradeDetails.color = params.tradeDetails.color;
            tradeDetails.ownerShip = params.tradeDetails.ownerShip;
            tradeDetails.loanType = params.tradeDetails.loanType;
            tradeDetails.amount = params.tradeDetails.amount;
            tradeDetails.remainingPayment = params.tradeDetails.remainingPayment;
            tradeDetails.EMIAmount = params.tradeDetails.EMIAmount;
            tradeDetails.accidentHistory = {
                damageAmount: params.tradeDetails.damageAmount,
                insurancePayoutAmount: params.tradeDetails.insurancePayoutAmount
            };
            tradeDetails.mechanicalIssue = params.tradeDetails.mechanicalIssue;
            tradeDetails.warningLight = params.tradeDetails.warningLight;
            tradeDetails.afterMarketModification = params.tradeDetails.afterMarketModification;
            tradeDetails.additionalIsuse = params.tradeDetails.additionalIsuse;
            tradeDetails.estimatedBodyWorkAmount = params.tradeDetails.estimatedBodyWorkAmount;
            tradeDetails.smoke = params.tradeDetails.smoke;
            tradeDetails.photos = params.tradeDetails.photos;
        }

        let customerFinance = await new financeCarFixModel({
            dealerId: params.dealerId,
            customerId: customer._id,
            firstName: params.firstName,
            lastName: params.lastName,
            email: customer.email ? customer.email : params.email,
            orderType: 'WithoutCar',
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
            // status: '',
            gender: params.gender,
            DOB: params.DOB,
            documents: {
                category: params.category,
                file: params.file,
            },
            status: params.status ? params.status : '',
            tradeDetails: tradeDetails,
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
            finance = await financeCarFixModel.findById(financeId);
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
            customerSelectedCar: params.customerSelectedCar ? params.customerSelectedCar : undefined,
            dealerProvidedOptions: params.dealerProvidedOptions ? params.dealerProvidedOptions : undefined,
            deliveryDate: params.deliveryDate ? params.deliveryDate : undefined,
            selectedEMIOptions: params.selectedEMIOptions ? params.selectedEMIOptions : undefined,
            EMIOptions: params.EMIOptions ? params.EMIOptions : undefined,
            isTradeinCarAvilable: params.isTradeinCarAvilable,
            'tradeDetails.dealerEstimatedTradeValue': params.tradeInCarValue ? params.tradeInCarValue : params.dealerEstimatedTradeInValue
        }

        let updateFinanceStatus = await financeCashFlowModel.findByIdAndUpdate(params.financeId, update, { new: true });

        return updateFinanceStatus;
    },

    deleteFinanceOrder: async (financeId) => {
        await financeCarFixModel.findByIdAndDelete(financeId);

        return true;
    },

    getOrderByDealerId: async(dealer) => {
        const orderFix = await financeCarFixModel.find({ 
            $and: [
                { dealerId: dealer._id },
                { status: '' }
            ] 
        }).populate({ path: 'carId' }).populate({ path: 'customerId' });
        const orderCash = await financeCashFlowModel.find({ 
            $and: [
                { dealerId: dealer._id },
                { status: '' }
            ] 
        }).populate({ path: 'carId' }).populate({ path: 'customerId' });
        const orderWithoutCar = await financeWithoutCar.find({ 
            $and: [
                { dealerId: dealer._id },
                { status: '' }
            ] 
        }).populate({ path: 'carId' }).populate({ path: 'customerId' });

        return [...orderCash, ...orderFix, ...orderWithoutCar];
    },

    getAllCustomerRequestedOrders: async (dealer) => {
        const cashOrders = await financeCarFixModel.find({
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