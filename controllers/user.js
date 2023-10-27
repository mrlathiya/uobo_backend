const userServices = require('../services/user');

module.exports = {
    userRegistration: async (req, res, next) => {
        try {
            const params = req.body;

            const addUser = await userServices.registerUser(params);

            if (addUser) {
                return res.status(200).json({ IsSuccess: true, Data: [addUser], Message: 'User registered successfully' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'User not registered' });
            }    
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    signInUser: async (req, res, next) => {
        try {
            const params = req.body;

            
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    }
}