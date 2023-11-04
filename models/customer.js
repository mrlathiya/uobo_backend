const mongoose = require('mongoose');

const customerSchema = mongoose.Schema({
    name: {
        type: String,
    },
    gender: {
        type: String,
    },
    DOB: {
        type: String,
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
    documents: [
        {
            type: {
                type: String
            },
            file: {
                type: String
            }
        }
    ],
    preferredDeliveryMode: {
        type: String,
    },
},
{
    timestamps: true
});

module.exports = mongoose.model('customers', customerSchema);