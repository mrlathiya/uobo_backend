const mongoose = require('mongoose');

const dealerSchema = mongoose.Schema({
    dealerShipName: {
        type: String,
        require: true
    },
    address: {
        type: String,
        require: true
    },
    OMVICLicenceLink: {
        type: String,
        require: true
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
        type: Number,
        require: true
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
    location: {
        lat: {
            type: Number
        },
        long: {
            type: Number
        }
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('dealers', dealerSchema);