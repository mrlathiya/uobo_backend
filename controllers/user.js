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

            let checkExistUserWithEmail = await userServices.getUserByEmail(params.email);

            if (checkExistUserWithEmail.length) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'User already exist with this email' });
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
            const params = req.query;

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
    },

    editUserProfile: async (req, res, next) => {
        try {
            const params = req.body;

            const user = req.user;

            if (!user) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide valid authrized token' });
            }

            params.userId = user._id;

            let editProfile = await userServices.updateUserProfileInformation(params);

            if (editProfile) {
                return res.status(200).json({ IsSuccess: true, Data: editProfile, Message: 'User Profile Updated' });
            } else {
                return res.status(400).json({ IsSuccess: true, Data: [], Message: 'User Profile Not Updated' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    getAllUsers: async (req, res, next) => {
        try {
            let users = await userServices.getAllUsers();

            if (users.length) {
                return res.status(200).json({ IsSuccess: true, Count: users.length, Data: users, Message: 'All users found' }); 
            } else {
                return res.status(400).json({ IsSuccess: true, Data: [], Message: 'No users found' }); 
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    } 
}