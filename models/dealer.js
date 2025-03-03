const mongoose = require('mongoose');

const dealerSchema = mongoose.Schema({
    dealerShipName: {
        type: String,
        require: true
    },
    fcmToken: {
        type: String
    },
    address: {
        address1: {
            type: String
        },
        address2: {
            type: String
        },
        city: {
            type: String
        },
        postalcode: {
            type: String
        },
        state: {
            type: String
        },
        country: {
            type: String
        },
    },
    OMVICLicenceLink: {
        type: String,
        require: true
    },
    email: {
        type: String
    },
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    phoneNumber: {
        countryCode: {
            type: String
        },
        number: {
            type: Number
        }
    },
    companyRole: {
        type: String,
        require: true
    },
    numberOfLocation: {
        type: String,
        require: true
    },
    delivery: {
        uoboDelivery: {
            type: Boolean,
            default: false
        },
        ownDeliveryStaff: {
            type: Boolean,
            default: false
        },
    },
    customerPickUp: {
        type: Boolean,
        default: false
    },
    logo: {
        type: String
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    verificationOTP: {
        type: String
    },
    location: {
        lat: {
            type: Number
        },
        long: {
            type: Number
        }
    },
    inventory_csv: {
        type: String
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('dealers', dealerSchema);