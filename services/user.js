const jwt = require('jsonwebtoken');
const userSchema = require('../models/user');
const financeSchema = require('../models/finance');
const deletedCustomerSchema = require('../models/deletedUser');
const emailSchema = require('../models/emails');
const dealerSchema = require('../models/dealer');
const notificationSchema = require('../models/notificationStorage');
const customerPreferenceSchema = require('../models/userPreference');
const customerPromocodeSchema = require('../models/customerPromoCode');

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

    getUserByContactNumber: async (number) => {
        let existUser = await userSchema.findOne({ 'contact.number': number });

        return existUser;
    },

    getUserByEmail: async (email) => {
        let existUser = await userSchema.find({ email });

        return existUser;
    },

    storeCustomerOTP: async (email, otp) => {
        return await userSchema.findOneAndUpdate({ email }, { verificationOTP: otp }, { new: true });
    },

    verifyCustomer: async (customerId) => {
        return await userSchema.findByIdAndUpdate(customerId, { emailVerified: true }, { new: true });
    },

    createUserToken: async (userId) => {
        const token = jwt.sign(
        { 
            user_id: userId 
        },
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

    updatePaveURLInCustomer: async (customerId, paveReportURL) => {
        const updateURL = await userSchema.findByIdAndUpdate(customerId, { paveReportURL }, { new: true }); 

        return updateURL;
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
            marriedStatus: params.marriedStatus,
            salutation: params.salutation,
        };

        let updateCustomerDetails = await userSchema.findByIdAndUpdate(customerId, update, { new: true });

        return updateCustomerDetails;
    },

    getCustomerDealer: async (customerId, dealerId) => {
        let customer = await userSchema.findOne(customerId);
        let dealer = await dealerSchema.findOne(dealerId);

        return { customer, dealer }
    },

    getCustomerNotifications: async (customerId) => {
        let notificationData = await notificationSchema.find({ receiverId: customerId });

        return notificationData;
    },

    customerLicenceVerification: async (customerId,isVerify) => {
        let updateCustomerLicenceVerificationStatus = await userSchema.findByIdAndUpdate(customerId, 
                                        { 'licenceDetails.isVerify': isVerify }, 
                                        { new: true });

        return updateCustomerLicenceVerificationStatus;
    },

    deleteCustomerAndOrder: async (user, reason) => {

        const addCustomerToDeletedCustomer = await new deletedCustomerSchema({
            reason,
            firstName: user?.firstName ? user?.firstName : undefined,
            lastName: user?.lastName ? user?.lastName : undefined,
            middleName: user?.middleName ? user?.middleName : undefined,
            preferName: user?.preferName ? user?.preferName : undefined,
            email: user?.email ? user?.email : undefined,
            contact: user?.contact ? user?.contact : undefined,
            gender: user?.gender ? user?.gender : undefined,
            height: user?.height ? user?.height : undefined,
            age: user?.age ? user?.age : undefined,
            DOB: user?.DOB ? user?.DOB : undefined,
            fcmToken: user?.fcmToken ? user?.fcmToken : undefined,
            address: user?.address ? user?.address : undefined,
            currentLocation: user?.currentLocation ? user?.currentLocation : undefined,
            issued: user?.issued ? user?.issued : undefined,
            licenceDetails: user?.licenceDetails ? user?.licenceDetails : undefined,
            issuerOrg_region_full: user?.issuerOrg_region_full ? user?.issuerOrg_region_full : undefined,
            issuerOrg_region_abbr: user?.issuerOrg_region_abbr ? user?.issuerOrg_region_abbr : undefined,
            issuerOrg_full: user?.issuerOrg_full ? user?.issuerOrg_full : undefined,
            issuerOrg_iso2: user?.issuerOrg_iso2 ? user?.issuerOrg_iso2 : undefined,
            issuerOrg_iso3: user?.issuerOrg_iso3 ? user?.issuerOrg_iso3 : undefined,
            nationality_full: user?.nationality_full ? user?.nationality_full : undefined,
            nationality_iso2: user?.nationality_iso2 ? user?.nationality_iso2 : undefined,
            nationality_iso3: user?.nationality_iso3 ? user?.nationality_iso3 : undefined,
            eyeColor: user?.eyeColor ? user?.eyeColor : undefined,
            internalId: user?.internalId ? user?.internalId : undefined,
            vaultid: user?.vaultid ? user?.vaultid : undefined,
            matchrate: user?.matchrate ? user?.matchrate : undefined,
            executionTime: user?.executionTime ? user?.executionTime : undefined,
            responseID: user?.responseID ? user?.responseID : undefined,
            quota: user?.quota ? user?.quota : undefined,
            credit: user?.credit ? user?.credit : undefined,
            houseOwnership: user?.houseOwnership ? user?.houseOwnership : undefined,
            currentEmployment: user?.currentEmployment ? user?.currentEmployment : undefined,
            quota: user?.quota ? user?.quota : undefined,
            otherIncomeSource: user?.otherIncomeSource ? user?.otherIncomeSource : undefined,
            SIN: user?.SIN ? user?.SIN : undefined,
            documents: user?.documents ? user?.documents : undefined,
            preferredDeliveryMode: user?.preferredDeliveryMode ? user?.preferredDeliveryMode : undefined,
            marriedStatus: user?.marriedStatus ? user?.marriedStatus : undefined
        });

        await userSchema.findByIdAndDelete(user._id);

        const deleteOrder = await financeSchema.deleteMany({ customerId: user._id });

        return addCustomerToDeletedCustomer.save();
    },

    addCustomerPreferenceInformation: async (params) => {
        const addPreference = await new customerPreferenceSchema({
            customerId: params.customerId,
            bodyStyle: params.bodyStyle,
            MakeModel: params.MakeModel,
            color: params.color,
            minPrice: params.minPrice,
            maxPrice: params.maxPrice,
            minYear: params.minYear,
            maxYear: params.maxYear,
            minKMs: params.minKMs,
            maxKMs: params.maxKMs,
            drivetrain: params.drivetrain,
            transmission: params.transmission,
            email: params.email,
            contact: params.contact
        });

        if (addPreference !== null || addPreference !== undefined) {
            return addPreference.save();
        } else {
            return false;
        }
    },

    getCustomerPreferenceByPreferenceId: async (preferenceId) => {
        const customerPreferenceIs = await customerPreferenceSchema.findById(preferenceId);

        return customerPreferenceIs;
    },

    getCustomerPreferenceByCustomerId: async (customerId) => {
        const preference = await customerPreferenceSchema.find({ customerId });

        return preference;
    },

    updateCustomerExistPreferene: async (params, preferenceId) => {
        const update = {
            bodyStyle: params.bodyStyle ? params.bodyStyle : undefined,
            MakeModel: params.MakeModel ? params.MakeModel : undefined,
            color: params.color ? params.color : undefined,
            minPrice: params.minPrice ? params.minPrice : undefined,
            maxPrice: params.maxPrice ? params.maxPrice : undefined,
            minYear: params.minYear ? params.minYear : undefined,
            maxYear: params.maxYear ? params.maxYear : undefined,
            minKMs: params.minKMs ? params.minKMs : undefined,
            maxKMs: params.maxKMs ? params.maxKMs : undefined,
            drivetrain: params.drivetrain ? params.drivetrain : undefined,
            transmission: params.transmission ? params.transmission : undefined,
            email: params.email ? params.email : undefined,
            contact: params.contact ? params.contact : undefined
        }

        const editPreference = await customerPreferenceSchema.findByIdAndUpdate(preferenceId, update, { new: true });

        return editPreference;
    },

    addNewPromocode: async (params) => {
        const addPromocode = await new customerPromocodeSchema({
            businessOwner: params.businessOwner,
            promoCode: params.promoCode,
            activationStatus: params.activationStatus !== undefined && params.activationStatus !== '' ? params.activationStatus : false,
            promoAmount: params.promoAmount ? Number(params.promoAmount) : 0
        });

        if (addPromocode) {
            return addPromocode.save();
        } else {
            return undefined;
        }
    },

    getCustomerPromocodeByMobileNumer: async (mobileNumber) => {
        const customerPromocode = await customerPromocodeSchema.find({ mobileNumber });

        return customerPromocode;
    },

    getAllPromocode: async () => {
        const customerPromocode = await customerPromocodeSchema.find().populate({
            path: 'claimedBy'
        });

        return customerPromocode;
    },

    getPromocodeById: async (promocodeId) => {
        const customerPromocode = await customerPromocodeSchema.findById(promocodeId);

        return customerPromocode;
    },

    getPromocodeByCustomerId: async (customerId) => {
        const customerPromocode = await customerPromocodeSchema.findOne({ customerId });

        return customerPromocode;
    },

    getCustomerRedeemedPromocode: async (customerId, promoCode) => {
        const customerPromocode = await customerPromocodeSchema.findOne({ 
            $and: [
                {
                    promoCode
                },
                {
                    claimedBy: customerId
                }
            ] 
        });

        return customerPromocode;
    },

    getCustomerExistPromocode: async (customerId) => {
        const customerPromocode = await customerPromocodeSchema.findOne({ customerId, claimStatus: false });

        return customerPromocode;
    },

    getExistPromocode: async (promoCode) => {
        const promocodeIs = await customerPromocodeSchema.findOne({ promoCode, activationStatus: true });

        return promocodeIs;
    },

    editPromocodeActivationStatus: async (promocodeId) => {
        const updatePromocode = await customerPromocodeSchema.findByIdAndUpdate(promocodeId, { activationStatus: true }, { new: true });

        return updatePromocode;
    },

    updatePromocodeStatus: async (customerId, promoCode) => {
        const update = {
            $addToSet: { claimedBy: customerId }
        };

        const updatedPromocode = await customerPromocodeSchema.findOneAndUpdate(
            { 
                promoCode, 
                activationStatus: true 
            },
            update,                   
            { new: true }
        );

        return updatedPromocode;
    }
}