const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        firstName: {
            type: String
        },
        lastName: {
            type: String
        },
        middleName: {
            type: String
        },
        preferName: {
            type: String
        },
        email: {
            type: String
        },
        contact: {
            countryCode: {
                type: Number
            },
            number: {
                type: Number
            }
        },
        sex: {
            type: String
        },
        height: {
            type: Number
        },
        age: {
            type: Number
        },
        DOB: {
            type: String
        },
        address: {
            address1: {
                type: String
            },
            address2: {
                type: String
            },
            postcode: {
                type: String
            },
        },
        currentLocation: {
            lat: {
                type: Number
            },
            long: {
                type: Number
            },
        },
        issued: {
            type: String
        },
        licenceDetails: {
            licenceNumber: {
                type: String
            },
            class: {
                type: String
            },
            dateOfExpiry: {
                type: Date
            },
            dl_front_image: {
                type: String
            },
            dl_back_image: {
                type: String
            },
            isVerify: {
                type: Boolean,
                default: false
            }
        },
        issuerOrg_region_full: {
            type: String
        },
        issuerOrg_region_abbr: {
            type: String
        },
        issuerOrg_full: {
            type: String
        },
        issuerOrg_iso2: {
            type: String
        },
        issuerOrg_iso3: {
            type: String
        },
        nationality_full: {
            type: String
        },
        nationality_iso2: {
            type: String
        },
        nationality_iso3: {
            type: String
        },
        eyeColor: {
            type: String
        },
        internalId: {
            type: String
        },
        vaultid: {
            type: String
        },
        matchrate: {
            type: Number
        },
        executionTime: {
            type: Number
        },
        responseID: {
            type: String
        },
        quota: {
            type: Number
        },
        credit: {
            type: Number
        },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('users', userSchema);