require("dotenv").config();
const financeService = require('../services/finance');
const customerService = require('../services/user');
const docusign = require('../docusign/jwtConsole');
const awsServices = require('../config/aws-services');
const sendNotification = require('../config/send-notification');

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

                console.log(uploadFiles);
            } 

            let addFinance = await financeService.addCustomerCashFinance(params, customer);

            if (addFinance) {
                if (customer.token) {
                    const title = `New cash order created`;
                    const content = `Order by ${customer.firstName} ${customer.lastName}`;
                    const dataContent = '';
                    await sendNotification.sendFirebaseNotification(customer.token,title, content, dataContent, 'CustomerCashFinanceAlert', customer._id, params.dealerId, false);
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

            let addFinance = await financeService.addCustomerFixFinance(params, customer);
            let editCustomerFinancialInformation = await customerService.editCustomerFinancialDetails(customer._id, params);

            if (addFinance) {
                if (customer.token) {
                    const title = `New Without order created`;
                    const content = `Order by ${customer.firstName} ${customer.lastName}`;
                    const dataContent = '';
                    await sendNotification.sendFirebaseNotification(customer.token,title, content, dataContent, 'CustomerFixFinanceAlert', customer._id, params.dealerId, false);
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

            if (params.status === 'CustomerPaidFullInCash') {
                let editStatus = await financeService.editFinancePaidStatus(params);

                if (req.userType === 'customer') {
                    if (user.token) {
                        const title = `Customer edited finance`;
                        const content = `Cash Order edit by ${user.firstName} ${user.lastName}`;
                        const dataContent = '';
                        await sendNotification.sendFirebaseNotification(user.token,title, content, dataContent, 'CustomerCashFinanceUpdateByCustomerAlert', user._id, editStatus[0].dealerId, false);
                    }
                } else {
                    if (user.token) {
                        const title = `Dealer edited cash finance`;
                        const content = `Cash Order edited by ${user.firstName} ${user.lastName}`;
                        const dataContent = '';
                        await sendNotification.sendFirebaseNotification(user.token,title, content, dataContent, 'CustomerCashFinanceUpdateByDealerAlert', user._id, editStatus[0].customerId, true);
                    }
                }                

                if (editStatus) {
                    return res.status(200).json({ IsSuccess: true, Data: editStatus, Message: `Finance status updated ${params.status}` });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Finance status not updated' });
                }
            }

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

            if (params.confirmAvailabilty === true) {
                if (!params.status) {
                    return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide status parameter' });
                }

                if (params.documents) {
                    let uploadFiles = await awsServices.listOfDocuments(params.documents, 'Customer_Cash_Finance');
    
                    params.documents = uploadFiles;
    
                    console.log(uploadFiles);
                } 
    
                // if (!params.tradeInCarValue) {
                //     return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide tradeInCarValue parameter' });
                // }
    
                // if (!params.appointments) {
                //     return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide appointments parameter' });
                // }

                let editStatus = await financeService.editFinanceStatus(params, 'cashFinance');

                if (editStatus) {

                    if (req.userType === 'customer') {
                        if (user.token) {
                            const title = `Customer edited finance`;
                            const content = `Cash Order edit by ${user.firstName} ${user.lastName}`;
                            const dataContent = '';
                            await sendNotification.sendFirebaseNotification(user.token,title, content, dataContent, 'CustomerCashFinanceUpdateByCustomerAlert', user._id, editStatus[0].dealerId, false);
                        }
                    } else {
                        if (user.token) {
                            const title = `Dealer edited cash finance`;
                            const content = `Cash Order edited by ${user.firstName} ${user.lastName}`;
                            const dataContent = '';
                            await sendNotification.sendFirebaseNotification(user.token,title, content, dataContent, 'CustomerCashFinanceUpdateByDealerAlert', user._id, editStatus[0].customerId, true);
                        }
                    }  
                    
                    return res.status(200).json({ IsSuccess: true, Data: editStatus, Message: `Finance status updated ${params.status}` });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Finance status not updated' });
                }
            } else {
                let deleteFinance = await financeService.deleteFinanceOrder(params.financeId);

                return res.status(200).json({  IsSuccess: true, Data: [], Message: 'Customer requested finance deleted'});
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    editCustomerFixFinanceStatus: async (req, res, next) => {
        try {
            const params = req.body;

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

                // let customerSelectedOption = await financeService.getCustomerSelectedOption(customerSelectedEMIOption);

                let editStatus = await financeService.editFinanceStatus(params, 'financeFix');

                if (editStatus) {
                    return res.status(200).json({ IsSuccess: true, Data: editStatus, Message: `Finance status updated ${params.status}` });
                } else {
                    // await financeService.deleteEMIOptions(EMIsIds);
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Finance status not updated' });
                }
            } else {
                let deleteFinance = await financeService.deleteFinanceOrder(params.financeId);

                return res.status(200).json({  IsSuccess: true, Data: [], Message: 'Customer requested finance deleted'});
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
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Customer requested orders not found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    sendDocuSignDoc: async (req, res, next) => {
        try {

            // console.log('hello');

            const { signerEmail, signerName, ccEmail, ccName } = req.body;

            // Invoke DocuSign functionality
            const envelopeId = await docusign.main(signerEmail, signerName, ccEmail, ccName);

            // Return envelope ID in the response
            res.json({ envelopeId });
            
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    getFinanceOrder: async (req, res, next) => {
        try {
            const orderId = req.query.orderId;
            const amount = req.query.amount;

            if (orderId === undefined || orderId === null || orderId === '') {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Something went wrong' });
            }

            if (amount === undefined || amount === null || amount === '') {
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