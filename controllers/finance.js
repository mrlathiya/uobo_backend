const financeService = require('../services/finance');

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
    }
}