const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        firstName: {
            type: String
        },
        lastName: {
            type: String
        },
        preferName: {
            type: String
        },
        address: {
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
            image: {
                type: String
            },
            isVerify: {
                type: Boolean,
                default: false
            }
        },
        DOB: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('users', userSchema);