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

    loginUser: async (params) => {
        
    }
}