const mongoose = require('mongoose');
const financeModel = require('../models/finance');
const userModel = require('../models/user');
const mortgageTypeModel = require('../models/mortgageType');
const EMIOptionsModel = require('../models/EMIOptions');

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

        let customerFinance = await new financeModel({
            dealerId: params.dealerId,
            customerId: customer._id,
            carId: params.carId,
            firstName: params.firstName,
            lastName: params.lastName,
            financeOrderId: params.financeOrderId,
            email: customer.email ? customer.email : params.email,
            category: 'Cash',
            contact: {
                countryCode: customer.contact.countryCode ? customer.contact.countryCode : params.countryCode,
                number: customer.contact.number ? customer.contact.number : params.number,
            },
            address: {
                address: params.address.address1,
                city: params.address.city,
                postalCode: params.address.postalCode,
                province: params.address.province,
            },
            gender: params.gender,
            paveSessionKey: params.paveSessionKey,
            DOB: params.DOB,
            documents: params.documents,
            status: '',
            isTradeinCarAvilable: params.isTradeinCarAvilable,
            tradeDetails: tradeDetails,
            referralCode: params.referralCode ? params.referralCode : undefined,
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

        let customerFinance = await new financeModel({
            dealerId: params.dealerId,
            customerId: customer._id,
            carId: params.carId,
            firstName: params.firstName,
            lastName: params.lastName,
            financeOrderId: params.financeOrderId,
            email: customer.email ? customer.email : params.email,
            category: 'Fix',
            contact: {
                countryCode: customer.contact.countryCode ? customer.contact.countryCode : params.countryCode,
                number: customer.contact.number ? customer.contact.number : params.number,
            },
            address: params.address,
            status: '',
            gender: params.gender,
            DOB: params.DOB,
            isTradeinCarAvilable: params.isTradeinCarAvilable,
            documents: params.documents,
            status: params.status,
            tradeDetails: tradeDetails,
            maxDownPayment: params.maxDownPayment,
            desiredDownPayment: params.desiredDownPayment,
            EMIOptions: params.EMIOptions,
            paveSessionKey: params.paveSessionKey,
            referralCode: params.referralCode,
            monthlyRentAmount: params.monthlyRentAmount,
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

        let customerFinance = await new financeModel({
            // dealerId: params.dealerId,
            customerId: customer._id,
            firstName: params.firstName,
            lastName: params.lastName,
            financeOrderId: params.financeOrderId,
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
            carPreference: params.carPreference,
            gender: params.gender,
            DOB: params.DOB,
            documents: params.documents,
            status: params.status ? params.status : '',
            tradeDetails: tradeDetails,
        });

        if (customerFinance) {
            return customerFinance.save();
        } else {
            return undefined;
        }
    },

    getFinanceById: async (financeId) => {

        let finance = await financeModel.findById(financeId)
        .populate({
            path: 'customerId'
        })
        .populate({
            path: 'carId'
        });

        return finance;
    },

    getFinanceByIdWithCustomerDealerDetails: async (financeId) => {

        let finance = await financeModel.findById(financeId)
                                        .populate({
                                            path: 'customerId'
                                        })
                                        .populate({
                                            path: 'dealerId'
                                        });

        return finance;
    },

    editFinancePaidStatus: async (params) => {
        let update = {
            status: 'CustomerPaidFullInCash'
        }

        let updateFinanceStatus = await financeModel.findByIdAndUpdate(params.financeId, update, { new: true });

        return updateFinanceStatus;
    },

    getCustomerSelectedOption: async (optionId) => {
        const optionIdIs = new mongoose.Types.ObjectId(optionId);
        let selectedEMIOption = await EMIOptionsModel.aggregate([
            {
                $unwind: { path: "$options", preserveNullAndEmptyArrays: true }
            },
            {
                $match: {
                    'options._id': optionIdIs 
                }
            }
        ]);

        return selectedEMIOption;
    },

    editFinanceStatus: async (params, type) => {
        let update;

        if (params.services) {
            update = {
                status: params.status,
                appointments: params.appointments,
                customerDepositAmount: params?.customerDepositAmount ? params.customerDepositAmount : undefined,
                billOfSale: params.billOfSale,
                $push: { documents: params.documents },
                additionalDocuments: params.additionalDocuments,
                customerSelectedCar: params.customerSelectedCar ? params.customerSelectedCar : undefined,
                dealerId: params.dealerId ? params.dealerId : undefined,
                dealerProvidedOptions: params.dealerProvidedOptions ? params.dealerProvidedOptions : undefined,
                deliveryDate: params.deliveryDate ? params.deliveryDate : undefined,
                selectedEMIOptions: params.selectedEMIOptions ? params.selectedEMIOptions : undefined,
                financeApproval: params.financeApproval ? Boolean(params.financeApproval) : undefined,
                EMIOptions: params.EMIOptions ? params.EMIOptions : undefined,
                cancellationReason: params.cancellationReason ? params.cancellationReason : undefined,
                selectedAppointment: params.selectedAppointment ? params.selectedAppointment : undefined,
                customerSelectedEMIOption: params.selectedPlan ? params.selectedPlan : undefined,
                selectedBreakdown: params.selectedBreakdown ? params.selectedBreakdown : undefined,
                isTradeinCarAvilable: params.isTradeinCarAvilable,
                maxDownPayment: params.maxDownPayment ? params.maxDownPayment : undefined,
                monthlyRentAmount: params.monthlyRentAmount ? params.monthlyRentAmount : undefined,
                customerTradeInDecision: params.customerTradeInDecision ? params.customerTradeInDecision : undefined,
                desiredDownPayment: params.desiredDownPayment ? params.desiredDownPayment : undefined,
                tradeInCarOfferedPrice: params.tradeInCarOfferedPrice ? params.tradeInCarOfferedPrice : undefined,
                selectedAdditionalService: params.selectedAdditionalService ? params.selectedAdditionalService : undefined,
                'tradeDetails.dealerEstimatedTradeValue': params.tradeInCarValue ? params.tradeInCarValue : params.dealerEstimatedTradeInValue,
                $push: {
                    additionalService: { $each: params.services }
                },
            }
        } else {
            update = {
                status: params.status,
                appointments: params.appointments,
                customerDepositAmount: params?.customerDepositAmount ? params.customerDepositAmount : undefined,
                billOfSale: params.billOfSale,
                $push: { documents: params.documents },
                additionalDocuments: params.additionalDocuments,
                customerSelectedCar: params.customerSelectedCar ? params.customerSelectedCar : undefined,
                dealerId: params.dealerId ? params.dealerId : undefined,
                dealerProvidedOptions: params.dealerProvidedOptions ? params.dealerProvidedOptions : undefined,
                deliveryDate: params.deliveryDate ? params.deliveryDate : undefined,
                selectedEMIOptions: params.selectedEMIOptions ? params.selectedEMIOptions : undefined,
                financeApproval: params.financeApproval ? Boolean(params.financeApproval) : undefined,
                EMIOptions: params.EMIOptions ? params.EMIOptions : undefined,
                cancellationReason: params.cancellationReason ? params.cancellationReason : undefined,
                selectedAppointment: params.selectedAppointment ? params.selectedAppointment : undefined,
                customerSelectedEMIOption: params.selectedPlan ? params.selectedPlan : undefined,
                isTradeinCarAvilable: params.isTradeinCarAvilable,
                maxDownPayment: params.maxDownPayment ? params.maxDownPayment : undefined,
                monthlyRentAmount: params.monthlyRentAmount ? params.monthlyRentAmount : undefined,
                customerTradeInDecision: params.customerTradeInDecision ? params.customerTradeInDecision : undefined,
                desiredDownPayment: params.desiredDownPayment ? params.desiredDownPayment : undefined,
                tradeInCarOfferedPrice: params.tradeInCarOfferedPrice ? params.tradeInCarOfferedPrice : undefined,
                selectedAdditionalService: params.selectedAdditionalService ? params.selectedAdditionalService : undefined,
                'tradeDetails.dealerEstimatedTradeValue': params.tradeInCarValue ? params.tradeInCarValue : params.dealerEstimatedTradeInValue
            }
        }

        let updateFinanceStatus = await financeModel.findByIdAndUpdate(params.financeId, update, { new: true });;
        
        return updateFinanceStatus;
    },

    addNewEMIOptions: async (params) => {
        const newEMI = await new EMIOptionsModel({
            bankName: params.bankName,
            options: params.options
        });

        if (newEMI !== null && newEMI !== undefined) {
            return newEMI.save();
        } else {
            return false;
        }
    },

    addBulkOfNewEMIOptions: async (EMIOptionsList) => {
        const newEMI = await EMIOptionsModel.insertMany(EMIOptionsList);

        if (newEMI) {
            return newEMI;
        } else {
            return false;
        }
    },

    deleteEMIOptions: async (EMIIds) => {

        for (let i=0;i<EMIIds;i++) {
            let deleteEMI = await EMIOptionsModel.findByIdAndDelete(EMIIds[i]);
        }

        return true;
    },

    deleteFinanceOrder: async (financeId) => {
        await financeModel.findByIdAndDelete(financeId);

        return true;
    },

    editOrderStatus: async (financeId, status, envelopeId, customerBillOfSaleURL) => {

        const update = { 
            status, 
            envelopeId: envelopeId !== undefined && envelopeId !== null && envelopeId !== '' ? envelopeId : '',
            $push: {
                documents: customerBillOfSaleURL
            }  
        }

        let editedStatus = await financeModel.findByIdAndUpdate(
            financeId, 
            update, 
            { new: true }
        );

        return editedStatus;
    },

    getOrderByEnvelopeId: async (envelopeId) => {
        let orderIs = await financeModel.findOne({ envelopeId });

        return orderIs;
    },

    editOrderByEnvelopeId: async (envelopeId) => {
        let editOrder = await financeModel.findOneAndUpdate({ envelopeId }, { status: 'CustomerSignedBillofSale' }, { new: true });

        return editOrder;
    },

    getOrderByDealerId: async(dealer) => {
        const orders = await financeModel.find({ 
            dealerId: dealer._id,
            status: ''
        }).populate({ path: 'carId' }).populate({ path: 'customerId' });

        let filterData = [];

        for (let i in orders) {
            if (orders[i].isTradeinCarAvilable === false) {
                filterData.push(orders[i]);
            } else if(orders[i].isTradeinCarAvilable === true && orders[i].paveReportURL !== '') {
                filterData.push(orders[i]);
            }
        }

        return filterData;
    },

    getOrderByDealerIdV1: async(dealer) => {
        const orders = await financeModel.find({ 
            dealerId: dealer._id,
        }).populate({ path: 'carId' }).populate({ path: 'customerId' });

        let filterData = [];

        for (let i in orders) {
            if (orders[i].isTradeinCarAvilable === false) {
                filterData.push(orders[i]);
            } else if(orders[i].isTradeinCarAvilable === true && orders[i].paveReportURL !== '') {
                filterData.push(orders[i]);
            }
        }

        return filterData;
    },

    getAllCustomerRequestedOrders: async (dealer) => {
        const orders = await financeModel.find({
            $and: [
                { dealerId: dealer._id },
                { status: '' }
            ]  
        });

        return orders;
    },

    getAllCustomerOrdersByCustomerId: async (customerId) => {
        const orders = await financeModel.find({ customerId });

        return orders;
    },

    getCustomerOrderByPaveSessionKey: async (customerId, paveSessionKey) => {
        const orders = await financeModel.find({ 
            $and: [
                { customerId },
                { paveSessionKey }
            ] 
        });

        return orders;
    },

    editPaveReportURLToCustomerOrders: async (ordersList, paveReportURL) => {

        let orders = [];
        for (i in ordersList) {
            console.log(ordersList[i], paveReportURL)
            let orderData = await financeModel.findByIdAndUpdate(ordersList[i]._id, { paveReportURL }, { new: true });

            orders.push(orderData);
        }

        return orders;
    },

    editAdditionalCarServices: async (params) => {
        let update = {
            $push: {
                additionalService: { $each: params.services }
            },
            status: 'DealerSentEMIOptions'
        }

        let updateFinanceOrderAdditionalService = await financeModel.findByIdAndUpdate(params.orderId, update, { new: true });

        return updateFinanceOrderAdditionalService;
    }
}