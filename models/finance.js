const mongoose = require('mongoose');

const financeSchema = mongoose.Schema({
    carType: [
        {
            type: String
        }
    ],
    preference: {
        type: String
    },
    make: {
        type: String
    },
    model: {
        type: String
    },
    priceRange: {
        start: {
            type: Number
        },
        end: {
            type: Number
        }
    },
    yearRange: {
        start: {
            type: Number
        },
        end: {
            type: Number
        }
    },
    mileageRange: {
        start: {
            type: Number
        },
        end: {
            type: Number
        }
    },
    driveTrain: {
        type: String
    },
    transmission: {
        type: String
    },
    colors: [{
        type: String
    }],
    color: {
        type: String
    },
    personalDetails: {
        type: String
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('emails', financeSchema);