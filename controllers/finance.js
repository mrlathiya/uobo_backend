require("dotenv").config();
const { trusted } = require('mongoose');
const financeService = require('../services/finance');
const customerService = require('../services/user');

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

            let addFinance = await financeService.addCustomerCashFinance(params, customer);

            if (addFinance) {
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

            let addFinance = await financeService.addCustomerFixFinance(params, customer);
            let editCustomerFinancialInformation = await customerService.editCustomerFinancialDetails(customer._id, params);

            if (addFinance) {
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

            if (params.status === 'CustomerPaidFullInCash') {
                let editStatus = await financeService.editFinancePaidStatus(params);

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
    
                // if (!params.tradeInCarValue) {
                //     return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide tradeInCarValue parameter' });
                // }
    
                // if (!params.appointments) {
                //     return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide appointments parameter' });
                // }

                let editStatus = await financeService.editFinanceStatus(params, 'cashFinance');

                if (editStatus) {
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
    
                // if (!params.tradeInCarValue) {
                //     return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide tradeInCarValue parameter' });
                // }
    
                // if (!params.appointments) {
                //     return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide appointments parameter' });
                // }

                if (params.EMIOptions) {
                    let EMIs = await financeService.addBulkOfNewEMIOptions(params.EMIOptions);

                    console.log(EMIs);

                    if (EMIs) {
                        EMIs.forEach(EMI => {
                            EMIsIds.push(EMI._id)
                        });
                    }
                    
                    params.EMIOptions = EMIsIds;
                }

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

            if (!params.dealerId) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide dealerId' });
            }

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

            if (params.confirmAvailabilty === true) {
                if (!params.status) {
                    return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide status parameter' });
                }
    
                // if (!params.tradeInCarValue) {
                //     return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide tradeInCarValue parameter' });
                // }
    
                // if (!params.appointments) {
                //     return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide appointments parameter' });
                // }

                // if (params.customerSelectedCar) {
                //     if (params.customerSelectedCar.EMIOptions) {
                //         let paramForEMIs = params?.customerSelectedCar?.EMIOptions;
                //         let EMIs = await financeService.addNewEMIOptions(paramForEMIs);
    
                //         // if (EMIs) {
                //         //     EMIs.forEach(EMI => {
                //         //         EMIsIds.push(EMI._id)
                //         //     });
                //         // }
    
                //         params.customerSelectedCar.EMIOptions = EMIs._id;
                //     }
                // }

                if (params.EMIOptions) {
                    let EMIs = await financeService.addBulkOfNewEMIOptions(params.EMIOptions);

                    if (EMIs) {
                        EMIs.forEach(EMI => {
                            EMIsIds.push(EMI._id)
                        });
                    }

                    params.EMIOptions = EMIsIds;
                }

                let editStatus = await financeService.editFinanceStatus(params);

                if (editStatus) {
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
    }

}