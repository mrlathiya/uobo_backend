const mongoose = require('mongoose');

const customerPreferenceSchema = mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    bodyStyle: [{
        type: String
    }],
    MakeModel: [{
        type: String
    }],
    color: [{
        type: String
    }],
    minPrice: {
        type: String
    },
    maxPrice: {
        type: String
    },
    minYear: {
        type: String
    },
    maxYear: {
        type: String
    },
    minKMs: {
        type: String
    },
    maxKMs: {
        type: String
    },
    drivetrain: {
        type: String
    },
    transmission: {
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
},
{
    timestamps: true
});

module.exports = mongoose.model('customerPreference', customerPreferenceSchema);