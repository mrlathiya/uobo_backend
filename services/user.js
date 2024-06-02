const jwt = require('jsonwebtoken');
const userSchema = require('../models/user');
const emailSchema = require('../models/emails');
const dealerSchema = require('../models/dealer');

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

        if (addUser !== null || addUser !== undefined) {
            return addUser.save();
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

    getUserByEmail: async (email) => {
        let existUser = await userSchema.find({ email });

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
    
    getUserById: async (userId) => {
        let user = await userSchema.findById(userId);

        return user;
    },

    updateCustomerFCMToken: async (customerId, fcmToken) => {
        let update = {
            fcmToken
        }

        let editCustomerToken = await userSchema.findByIdAndUpdate(customerId, update, { new: true });

        return editCustomerToken;
    },

    updateUserProfileInformation: async (params, user) => {
        let update = {
            firstName: params.firstName !== '' && params.firstName !== undefined ? params.firstName : undefined,
            lastName: params.lastName !== '' && params.lastName !== undefined ? params.lastName : undefined,
            middleName: params.middleName !== '' && params.middleName !== undefined ? params.middleName : undefined,
            preferName: params.preferName !== '' && params.preferName !== undefined ? params.preferName : undefined,
            sex: params.sex !== '' && params.sex !== undefined ? params.sex : undefined,
            height: params.height !== '' && params.height !== undefined ? params.height : undefined,
            age: params.age !== '' && params.age !== undefined ? params.age : undefined,
            DOB: params.DOB !== '' && params.DOB !== undefined ? params.DOB : undefined,
            address: {
                address1: params.address1 !== undefined && params.address1 !== '' ? params.address1 : undefined,
                address2: params.address2 !== '' && params.address1 !== undefined ? params.address1 : undefined,
                postcode: params.postcode !== '' && params.address1 !== undefined ? params.address1 : undefined
            },
            licenceDetails: {
                licenceNumber: params.licenceNumber !== '' && params.licenceNumber !== undefined ? params.licenceNumber : undefined,
                class: params.class !== '' && params.class !== undefined ? params.class : undefined,
                dateOfExpiry: params.dateOfExpiry !== '' && params.dateOfExpiry !== undefined ? params.dateOfExpiry : undefined,
                image: params.image !== '' && params.image !== undefined ? params.image : undefined,
                isVerify: params.isVerify !== '' && params.isVerify !== undefined ? params.isVerify : undefined
            },
            issued: params.issued !== '' && params.issued !== undefined ? params.issued : undefined,
            issuerOrg_region_full: params.issuerOrg_region_full !== '' && params.issuerOrg_region_full !== undefined ? params.issuerOrg_region_full : undefined,
            issuerOrg_region_abbr: params.issuerOrg_region_abbr !== '' && params.issuerOrg_region_abbr !== undefined ? params.issuerOrg_region_abbr : undefined,
            issuerOrg_full: params.issuerOrg_full !== '' && params.issuerOrg_full !== undefined ? params.issuerOrg_full : undefined,
            issuerOrg_iso2: params.issuerOrg_iso2 !== '' && params.issuerOrg_iso2 !== undefined ? params.issuerOrg_iso2 : undefined,
            issuerOrg_iso3: params.issuerOrg_iso3 !== '' && params.issuerOrg_iso3 !== undefined ? params.issuerOrg_iso3 : undefined,
            nationality_full: params.nationality_full !== '' && params.nationality_full !== undefined ? params.nationality_full : undefined,
            nationality_iso2: params.nationality_iso2 !== '' && params.nationality_iso2 !== undefined ? params.nationality_iso2 : undefined,
            nationality_iso3: params.nationality_iso3 !== '' && params.nationality_iso3 !== undefined ? params.nationality_iso3 : undefined,
            eyeColor: params.eyeColor !== '' && params.eyeColor !== undefined ? params.eyeColor : undefined,
            internalId: params.internalId !== '' && params.internalId !== undefined ? params.internalId : undefined,
            matchrate: params.matchrate !== '' && params.matchrate !== undefined ? params.matchrate : undefined,
            vaultid: params.vaultid !== '' && params.vaultid !== undefined ? params.vaultid : undefined,
            executionTime: params.executionTime !== '' && params.executionTime !== undefined ? params.executionTime : undefined,
            responseID: params.responseID !== '' && params.responseID !== undefined ? params.responseID : undefined,
            quota: params.quota !== '' && params.quota !== undefined ? params.quota : undefined,
            credit: params.credit !== '' && params.credit !== undefined ? params.credit : undefined,
        }

        let updateUser = await userSchema.findByIdAndUpdate(params.userId, update, { new: true });

        if (updateUser) {
            return updateUser;
        } else {
            return false;
        }
    },

    getAllUsers: async () => {
        let user = await userSchema.find();

        return user;
    },

    verifyUserLicence: async (params) => {
        let update = {
            licenceDetails: {
                dl_front_image: params.dl_front_image,
                dl_back_image: params.dl_back_image,
                isVerify: params.isVerify
            }
        }

        let updateUserLicenceDetails = await userSchema.findByIdAndUpdate(params.userId, update, { new: true });

        return updateUserLicenceDetails;
    },

    editUserCurrentLocation: async (params) => {
        let update = {
            currentLocation: {
                lat: params.lat,
                long: params.long
            }
        }

        let editUserLocation = await userSchema.findByIdAndUpdate(params.userId, update, { new: true });

        return editUserLocation;
    },

    addUserEmail: async (email) => {
        let addEmail = await new emailSchema({
            email
        });

        return addEmail;
    },

    editCustomerFinancialDetails: async (customerId, params) => {
        let update = {
            houseOwnership: params.houseOwnership,
            currentEmployment: params.currentEmployment,
            grossIncome: params.grossIncome,
            otherIncomeSource: params.otherIncomeSource,
            SIN: params.SIN,
        };

        let updateCustomerDetails = await userSchema.findByIdAndUpdate(customerId, update, { new: true });

        return updateCustomerDetails;
    },

    getCustomerDealer: async (customerId, dealerId) => {
        let customer = await userSchema.findOne(customerId);
        let dealer = await dealerSchema.findOne(dealerId);

        return { customer, dealer }
    }
}