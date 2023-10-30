const userServices = require('../services/user');

module.exports = {
    userRegistration: async (req, res, next) => {
        try {
            const params = req.body;

            if (!params.email) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'User email is required' });
            }

            if (!params.countryCode) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Country code is required' });
            }

            if (!params.number) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Mobile number is required' });
            }

            let checkExistUser = await userServices.getUserByMobileNumber(params);

            if (checkExistUser.length) {
                return res.status(400).json({ 
                    IsSuccess: false, Data: [], Message: 'User already exist with this contact information'
                });
            }

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

            if (!params.countryCode) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Country code is required' });
            }

            if (!params.number) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Mobile number is required' });
            }

            let checkExistUser = await userServices.getUserByMobileNumber(params);

            if (checkExistUser.length === 1) {
                const userId = checkExistUser[0]._id;
                let token = await userServices.createUserToken(userId);
                if (token) {
                    return res.status(200).json({ IsSuccess: true, Data: checkExistUser, token, Message: 'User logged In...!!!' });
                } else {
                    return res.status(400).json({ IsSuccess: true, Data: [], Message: 'Token not created' });
                }
            } else {
                return res.status(400).json({ IsSuccess: true, Data: checkExistUser, token, Message: 'User not found' });
            }
            
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    }
}