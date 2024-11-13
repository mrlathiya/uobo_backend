require("dotenv").config();
const financeService = require('../services/finance');
const customerService = require('../services/user');
const dealerServices = require('../services/dealer');
const carServices = require('../services/car');
const docusign = require('../docusign/jwtConsole');
const docusignDealer = require('../docusign/jwtDealerConsole');
const awsServices = require('../config/aws-services');
const sendNotification = require('../config/send-notification');
const path = require('path');
const fs = require('fs');

const generateOrderNumber = () => {
    const prefix = 'ORD-';
    const randomNumber = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}${randomNumber}`;
}

module.exports = {
    addCustomerFinanceDetails: async (req, res, next) => {
        try {
            const params = req.body;

            const user = req.user;

            if (!user) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide valid authrized token' });
            }

            if (!params.carType) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: "carType is required parameter" });
            }

            if (!params.preference) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: "preference is required parameter" });
            }

            if (!params.make) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: "make is required parameter" });
            }
            
            if (!params.model) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: "model is required parameter" });
            }

            if (!params.priceRange) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: "priceRange is required parameter" });
            }

            if (!params.address1) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: "Address1 is required parameter" });
            }

            if (!params.address2) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: "Address2 is required parameter" });
            }

            if (!params.postcode) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: "Postcode is required parameter" });
            }

            params.userId = user._id;

            let addNewFinance = await financeService.addCustomerFinance(params);

            if (addNewFinance) {
                let editUserDetails = await financeService.editUserFinanceDetails(params);
                return res.status(200).json({ IsSuccess: true, Data: [addNewFinance], Message: 'User finance added' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'User finance not added' });
            }

        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    addCustomerFinanceCashFlow: async (req, res, next) => {
        try {
            const params = req.body;
            const customer = req.user;

            if (!params.dealerId) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide dealerId' });
            }

            if (!customer._id) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide customerId' });
            }

            if (!params.carId) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide carId' });
            }

            if (params.documents) {
                let uploadFiles = await awsServices.listOfDocuments(params.documents, 'Customer_Cash_Finance');

                params.documents = uploadFiles;
            } 

            let dealerIs = await dealerServices.getDealerByDealerId(params.dealerId);

            if(dealerIs === undefined || dealerIs === null) {
                return res.status(200).json({ IsSuccess: false, Data: [], Message: 'Dealer not found' });
            }

            const orderNumber = generateOrderNumber();

            params.financeOrderId = orderNumber;

            let addFinance = await financeService.addCustomerCashFinance(params, customer);

            if (addFinance) {
                let carIs = await carServices.getCarById(params.carId);
                if (dealerIs.fcmToken) {
                    const title = `${customer.firstName} ${customer.lastName} inquired for cash purchase ${carIs.Make} ${carIs.Model}`;
                    const content = `Order by ${customer.firstName} ${customer.lastName}`;
                    const dataContent = '';
                    await sendNotification.sendFirebaseNotification(dealerIs.fcmToken,title, content, dataContent, 'CustomerCashFinanceAlert', customer._id, params.dealerId, false);
                }
                return res.status(200).json({ IsSuccess: true, Data: [addFinance], Message: 'Customer cash finance added' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Customer cash finance not added' });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    addCustomerFinanceFixFlow: async (req, res, next) => {
        try {
            const params = req.body;
            const customer = req.user;

            if (!params.dealerId) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide dealerId' });
            }

            if (!customer._id) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide customerId' });
            }

            if (!params.carId) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide carId' });
            }

            if (params.documents) {
                let uploadFiles = await awsServices.listOfDocuments(params.documents, 'Customer_Fix_Finance');

                params.documents = uploadFiles;

                // console.log(uploadFiles);
            }

            if (params.monthlyRentAmount) {
                params.houseOwnership.monthlyRentAmount = params.monthlyRentAmount
            }
            
            let dealerIs = await dealerServices.getDealerByDealerId(params.dealerId);

            if(dealerIs === undefined || dealerIs === null) {
                return res.status(200).json({ IsSuccess: false, Data: [], Message: 'Dealer not found' });
            }

            const orderNumber = generateOrderNumber();

            params.financeOrderId = orderNumber;

            let addFinance = await financeService.addCustomerFixFinance(params, customer);
            let editCustomerFinancialInformation = await customerService.editCustomerFinancialDetails(customer._id, params);

            if (addFinance) {
                if (dealerIs.fcmToken) {
                    const title = `New Without car order created`;
                    const content = `Order by ${customer.firstName} ${customer.lastName}`;
                    const dataContent = '';
                    await sendNotification.sendFirebaseNotification(dealerIs.fcmToken,title, content, dataContent, 'CustomerFixFinanceAlert', customer._id, params.dealerId, false);
                }
                return res.status(200).json({ IsSuccess: true, Data: [addFinance, editCustomerFinancialInformation], Message: 'Customer fix finance added' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Customer fix finance not added' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    editCustomerCashFinanceStatus: async (req, res, next) => {
        try {
            const params = req.body;
            const user = req.user;

            // if (params.status === 'CustomerPaidFullInCash') {
            //     let editStatus = await financeService.editFinancePaidStatus(params);

            //     if (req.userType === 'customer') {
            //         if (user.fcmToken) {
            //             const title = `Customer edited finance`;
            //             const content = `Cash Order edit by ${user.firstName} ${user.lastName}`;
            //             const dataContent = '';
            //             await sendNotification.sendFirebaseNotification(user.fcmToken,title, content, dataContent, 'CustomerCashFinanceUpdateByCustomerAlert', user._id, editStatus[0].dealerId, false);
            //         }
            //     } else {
            //         if (user.fcmToken) {
            //             const title = `Dealer confirm your order`;
            //             const content = `Proceed with payment and choose delivery date`;
            //             const dataContent = '';
            //             await sendNotification.sendFirebaseNotification(user.fcmToken,title, content, dataContent, 'CustomerCashFinanceUpdateByDealerAlert', user._id, editStatus[0].customerId, true);
            //         }
            //     }                

            //     if (editStatus) {
            //         return res.status(200).json({ IsSuccess: true, Data: editStatus, Message: `Finance status updated ${params.status}` });
            //     } else {
            //         return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Finance status not updated' });
            //     }
            // }

            if (params.confirmAvailabilty === undefined || params.confirmAvailabilty === '' || params.confirmAvailabilty === null) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide confirmAvailabilty parameter' });
            }

            if (!params.financeId) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide financeId parameter' });
            }

            let finance = await financeService.getFinanceById(params.financeId);

            if (finance === undefined || finance === null) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Requested cash finance not found' });
            }
            let carIs = await carServices.getCarById(finance.carId);
            
            if (params.confirmAvailabilty === true) {
                if (!params.status) {
                    return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide status parameter' });
                }

                if (params.documents) {
                    let uploadFiles = await awsServices.listOfDocuments(params.documents, 'Customer_Cash_Finance');
    
                    params.documents = uploadFiles;

                }

                let editStatus = await financeService.editFinanceStatus(params, 'cashFinance');

                if (editStatus) {

                    let dealerIs = await dealerServices.getDealerByDealerId(editStatus.dealerId);
                    let customerIs = await customerService.getUserById(editStatus.customerId);

                    if (req.userType === 'customer') {
                        if (dealerIs.fcmToken) {
                            let title = `Customer edited finance`;
                            let content = `Cash Order edit by ${user.firstName} ${user.lastName}`;

                            if (editStatus.status === 'CustomerSentAdditionalDocs') {
                                title = `${customerIs.firstName} ${customerIs.lastName} has sent additional documents`;
                                content = `Review them now and take action`;
                            }
                            
                            if (editStatus.status === 'CustomerPaidFullInCashAndChooseTime' || editStatus.status === 'CustomerBookedAppointment') {
                                title = `${customerIs.firstName} ${customerIs.lastName} choose delivery date`;
                                content = `Confirm it now and send bill of sale to ${customerIs.firstName}`;
                            }

                            if (editStatus.status === 'CustomerSignedBillOfSale') {
                                title = `${customerIs.firstName} ${customerIs.lastName} has signed bill of sale`;
                                content = `Review it now and prepare for dispatch ${carIs?.Make} ${carIs?.Model}`;
                            }

                            await sendNotification.sendFirebaseNotification(dealerIs.fcmToken,title, content, '', 'CustomerCashFinanceUpdateByCustomerAlert', editStatus.customerId, dealerIs._id, false);

                            if (params.paveReportURL) {
                                await customerService.updatePaveURLInCustomer(customerIs._id, params.paveReportURL)
                            }
                        }
                    } else {
                        if (customerIs.fcmToken) {

                            let title = '';
                            let content = '';

                            if (editStatus.status === 'AdditionalDocumentAskedFromDealer') {
                                title = `${dealerIs.firstName} has asked for few additional documents`;
                                content = `Send them now to speed up your order`;   
                            }

                            if (editStatus.status === 'DealerSentAvailability') {
                                title = `${dealerIs.firstName} has confirmed car availability`;
                                content = `Make a payment and choose delivery date to secure your ${carIs?.Make} ${carIs?.Model}`;
                            }

                            if (editStatus.status === 'DealerSentBillOfSale') {
                                title = `${dealerIs.firstName} has sent bill of sale`;
                                content = `Let's close the deal`;
                                
                            }
                            
                            await sendNotification.sendFirebaseNotification(customerIs.fcmToken,title, content, '', 'CustomerCashFinanceUpdateByDealerAlert', editStatus.dealerId, customerIs._id, true);
                        }
                    }  
                    
                    return res.status(200).json({ IsSuccess: true, Data: editStatus, Message: `Finance status updated ${params.status}` });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Finance status not updated' });
                }
            } else {
                let updateCancelledOrderStatus = await financeService.editOrderStatus(params.financeId, 'cancelled');

                let title = `${params?.cancellationReason ? params?.cancellationReason : 'Sorry! Your requested car is not available'}`;
                let content = `${carIs?.Make} ${carIs?.Model} ${carIs?.Year}`;

                let dealerIs = await dealerServices.getDealerByDealerId(updateCancelledOrderStatus.dealerId);
                let customerIs = await customerService.getUserById(updateCancelledOrderStatus.customerId);

                if (customerIs?.fcmToken) {
                    await sendNotification.sendFirebaseNotification(customerIs.fcmToken, title, content, '', 'cancelledOrders', dealerIs?._id, customerIs._id);
                }

                return res.status(200).json({  IsSuccess: true, Data: [], Message: 'Customer order cancelled'});
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    editCustomerFixFinanceStatus: async (req, res, next) => {
        try {
            const params = req.body;
            const user = req.user;

            if (params.confirmAvailabilty === undefined || params.confirmAvailabilty === '' || params.confirmAvailabilty === null) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide confirmAvailabilty parameter' });
            }

            if (!params.financeId) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide financeId parameter' });
            }

            let finance = await financeService.getFinanceById(params.financeId, 'financeFix');

            if (finance === undefined || finance === null) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Requested car fix finance not found' });
            }
            
            let EMIsIds = [];
            if (params.confirmAvailabilty === true) {
                if (!params.status) {
                    return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide status parameter' });
                }

                if (params.EMIOptions) {
                    let EMIs = await financeService.addBulkOfNewEMIOptions(params.EMIOptions);

                    if (EMIs) {
                        EMIs.forEach(EMI => {
                            EMIsIds.push(EMI._id)
                        });
                    }
                    
                    params.EMIOptions = EMIsIds;
                };

                if (params.customerSelectedEMIOption) {
                    let selectedOption = await financeService.getCustomerSelectedOption(params.customerSelectedEMIOption);
    
                    if (!selectedOption) {
                        return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Customer selected EMI option plan not found' });
                    }
    
                    params.selectedPlan = {
                        bankName: selectedOption[0].bankName,
                        dealerId: selectedOption[0].dealerId,
                        plan: selectedOption[0].options
                    }
                }

                if (params.documents) {
                    let uploadFiles = await awsServices.listOfDocuments(params.documents, 'Customer_Fix_Finance');
    
                    params.documents = uploadFiles;
    
                    console.log(uploadFiles);
                }

                let editStatus = await financeService.editFinanceStatus(params, 'financeFix');

                let dealerIs = await dealerServices.getDealerByDealerId(editStatus.dealerId);

                let carIs = await carServices.getCarById(editStatus.carId);

                if (dealerIs === undefined || dealerIs === null) {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer not found' });
                }

                if (editStatus) {

                    if (req.userType === 'customer') {
                        if (dealerIs.fcmToken) {
                            let title = `Customer edited finance`;
                            let content = `Without car Order edit by ${user.firstName} ${user.lastName}`;
                            let dataContent = '';

                            if (editStatus.status === 'CustomerSentAdditionalDocs') {
                                title = `${user.firstName} ${user.lastName} has sent additional documents`;
                                content = `Review them now and take action`;
                            }

                            if (editStatus.status === 'DepositPaidByCustomer') {
                                title = `${user.firstName} ${user.lastName} has paid downpayment for the car ${carIs.Make} ${carIs.Model}`;
                                content = `Send ${user.firstName} EMI options and delivery date`;
                            }

                            if (editStatus.status === 'CustomerSelectEMIOptionAndChooseTime') {
                                title = `${user.firstName} ${user.lastName} has selected EMI option and chose delivery date`;
                                content = `Confirm it now and send bill of sale to ${user.firstName} `;
                            }

                            if (editStatus.status === 'CustomerSignedBillOfSale') {
                                title = `${user.firstName} ${user.lastName} has signed bill of sale`;
                                content = `Review it now and prepare for dispatch ${carIs.Make} ${carIs.Model}`;
                            }

                            await sendNotification.sendFirebaseNotification(dealerIs.fcmToken,title, content, dataContent, 'CustomerFixFinanceUpdateByCustomerAlert', editStatus.customerId, dealerIs._id, false);
                            if (params.paveReportURL) {
                                await customerService.updatePaveURLInCustomer(editStatus.customerId, params.paveReportURL)
                            }
                        }
                    } else {
                        let customerIs = await customerService.getUserById(editStatus.customerId);
                        if (customerIs.fcmToken) {

                            let title = `${user.firstName} has confirmed car availability`;
                            let content = `Pay downpayment and secure your ${carIs.Make} ${carIs.Model}`;
                            let dataContent = '';

                            if (editStatus.status === 'AdditionalDocumentAskedFromDealer') {
                                title = `${user.firstName} has asked for few additional documents`;
                                content = `Send them now to speed up your order`;
                                
                            }

                            if (editStatus.status === 'DealerSentAvailability') {
                                title = `${user.firstName} has confirmed car availability`;
                                content = `Pay downpayment and secure your ${carIs.Make} ${carIs.Model}`;
                                
                            }

                            if (editStatus.status === 'DealerSentEMIOptions') {
                                title = `${user.firstName} has sent EMI Options and appointment availability`;
                                content = `Choose EMI option and confirm delivery date now`;
                                
                            }

                            if (editStatus.status === 'DealerSentBillOfSale') {
                                title = `${user.firstName} has sent bill of sale`;
                                content = `Let's close the deal`;
                                
                            }
                            
                            await sendNotification.sendFirebaseNotification(customerIs.fcmToken,title, content, dataContent, 'CustomerFixFinanceUpdateByDealerAlert', editStatus.dealerId, customerIs._id, true);
                        }
                    }  
                    
                    return res.status(200).json({ IsSuccess: true, Data: editStatus, Message: `Finance status updated ${params.status}` });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Finance status not updated' });
                }
            } else {
                // let deleteFinance = await financeService.deleteFinanceOrder(params.financeId);
                let deleteFinance = await financeService.editOrderStatus(params.financeId, 'cancelled');

                return res.status(200).json({  IsSuccess: true, Data: [], Message: 'Customer requested finance cancelled due to car not available'});
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    addCustomerWithoutCarOrder: async (req, res, next) => {
        try {
            const params = req.body;
            const customer = req.user;

            // if (!params.dealerId) {
            //     return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide dealerId' });
            // }

            if (!customer._id) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide customerId' });
            }

            const orderNumber = generateOrderNumber();

            params.financeOrderId = orderNumber;

            let addFinance = await financeService.addWithoutCarOrder(params, customer);
            let editCustomerFinancialInformation = await customerService.editCustomerFinancialDetails(customer._id, params);

            if (addFinance) {
                return res.status(200).json({ IsSuccess: true, Data: [addFinance, editCustomerFinancialInformation], Message: 'Customer requested for without car order' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Customer order request failed' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    editCustomerWithoutCarStatus: async (req, res, next) => {
        try {
            const params = req.body;
            const user = req.user;

            if (!params.financeId) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide financeId parameter' });
            }

            let finance = await financeService.getFinanceById(params.financeId, 'financeFix');

            if (finance === undefined || finance === null) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Requested car fix finance not found' });
            }

            if (!params.status) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide status parameter' });
            }

            if (params.status === 'CustomerSelectedCar') {
                params.dealerId = params?.customerSelectedCar?.dealerId;

                if (!params.dealerId) {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer Id not found in customer selected car' });
                }
            }

            if (params.EMIOptions) {
                let EMIs = await financeService.addBulkOfNewEMIOptions(params.EMIOptions);

                if (EMIs) {
                    EMIs.forEach(EMI => {
                        EMIsIds.push(EMI._id)
                    });
                }

                params.EMIOptions = EMIsIds;
            }

            if (params.customerSelectedEMIOption) {
                let selectedOption = await financeService.getCustomerSelectedOption(customerSelectedEMIOption);

                if (!selectedOption) {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Customer selected EMI option plan not found' });
                }

                params.selectedPlan = {
                    bankName: selectedOption.bankName,
                    dealerId: selectedOption.dealerId,
                    plan: selectedOption.plan
                }
            }

            let editStatus = await financeService.editFinanceStatus(params);

            if (editStatus) {
                return res.status(200).json({ IsSuccess: true, Data: editStatus, Message: `Finance status updated ${params.status}` });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Finance status not updated' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    getCustomerFinance: async (req, res, next) => {
        try {
            const user = req.user;

            if (!user) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide valid authrized token' });
            }

            let finance = await financeService.getUserFinanceDetails(user._id);

            if (finance) {
                return res.status(200).json({ IsSuccess: true, Data: finance, Message: 'User finance details found' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'No finance details found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    addMortgageCategory: async (req, res, next) => {
        try {
            const typeList = req.body.mortgageList;

            if (!typeList.length) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide valid list of data' });
            } 

            let addCategory = await financeService.addMortgageTypes(typeList);

            if (addCategory.length) {
                return res.status(200).json({ IsSuccess: true, Data: addCategory, Message: 'Mortgage categories added' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Mortgage categories not added' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    getMortgageCategory: async (req, res, next) => {
        try {

            let mortgageList = await financeService.getMortgageList();

            if (mortgageList.length) {
                return res.status(200).json({ IsSuccess: true, Count: mortgageList.length, Data: mortgageList, Message: 'Mortgage categories found' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Mortgage categories not found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    getCustomerRequestedOrder: async (req, res, next) => {
        try {

            const dealer = req.user;

            const orders = await financeService.getOrderByDealerId(dealer);

            if (orders.length) {
                return res.status(200).json({ 
                    IsSuccess: true, 
                    Count: orders.length, 
                    Data: orders, 
                    Message: 'Customer requested orders found' 
                });
            } else {
                return res.status(200).json({ IsSuccess: false, Data: [], Message: 'Customer requested orders not found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    sendDocuSignDoc: async (req, res, next) => {
        try {

            const { signerEmail, signerName, ccEmail, ccName, placeholders, orderId } = req.body;

            const file = req.file;

            if (!file) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please pass valid bill of sale' });
            }

            if (orderId === undefined || orderId === null || orderId === '') {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please pass valid orderId' });
            }

            let checkExist = await financeService.getFinanceByIdWithCustomerDealerDetails(orderId);

            if (checkExist) {
                // Invoke DocuSign functionalitydocusignDealer
                const envelopeId = await docusign.main(signerEmail, signerName, placeholders, file, ccEmail, ccName);
                // const envelopeId = await docusignDealer.main(signerEmail, signerName, ccEmail, ccName);

                if (envelopeId) {
                    let fileName = `${checkExist?.customerId?.firstName}_${checkExist?.customerId?.lastName}_${checkExist?.customerId?._id}_${checkExist?.dealerId?._id}`;
                    let uploadedFile = await awsServices.uploadPDF(file, 'Customer_Bill_of_Sale', fileName);

                    let billOfSaleFile = {
                        category: 'BillOfSale',
                        file: uploadedFile?.URL ? uploadedFile?.URL : ''
                    };

                    await financeService.editOrderStatus(orderId, 'DealerSentBillOfSale', envelopeId, billOfSaleFile);

                    if (checkExist?.customerId?.fcmToken) {
                        title = `${checkExist?.dealerId?.firstName} has sent bill of sale`;
                        content = `Let's close the deal`;

                        const fcmToken = checkExist?.customerId?.fcmToken;

                        await sendNotification.sendFirebaseNotification(fcmToken, title, content, '', 'DealerSentBillOfSale', checkExist?.dealerId?._id, checkExist?.customerId?._id, true);
                    }

                    return res.status(200).json({ envelopeId });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Envelope not created' });
                }
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Finance order not found' });
            }
            
        } catch (error) {
            console.log(error)
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    getFinanceOrder: async (req, res, next) => {
        try {
            const orderId = req.query.orderId;

            if (orderId === undefined || orderId === null || orderId === '') {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Something went wrong' });
            }

            let orderInformation = await financeService.getFinanceById(orderId);

            if (orderInformation) {
                return res.status(200).json({ IsSuccess: true, Data: [orderInformation], Message: 'Order data found' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Data not found' });
            }
            
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    }

}