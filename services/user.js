const userSchema = require('../models/user');

module.exports = {
    registerUser: async (params) => {
        const addUser = await new userSchema({
            firstName: params.firstName,
            lastName: params.lastName,
            middleName: params.middleName,
            preferName: params.preferName,
            email: params.email,
            contact: {
                countryCode: params.countryCode,
                number: params.number
            }
        });

        if (!addUser) {
            await addUser.save()
            return true;
        } else {
            return false;
        }
    },

    getUserByMobileNumber: async (params) => {
        let existUser = await userSchema.find({
            $and: [
                { 'contact.countryCode': params.countryCode },
                { 'contact.number': params.number }
            ]
        });

        return existUser;
    },

    createUserToken: async (userId) => {
        const token = jwt.sign(
        { 
            user_id: userId },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
            },
        );
    
        return token;
      },
    

    loginUser: async (params) => {
        
    }
}