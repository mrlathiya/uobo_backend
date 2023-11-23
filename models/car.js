const mongoose = require('mongoose');

const carSchema = mongoose.Schema({
    model: {
        type: String
    },
    make: {
        type: String
    },
    year: {
        type: String
    },
    trim: {
        type: String
    },
    location: {
        lat: {
            type: Number
        },
        long: {
            type: Number
        },
    },
    mileage: {
        type: String
    },
    pricing: {
        type: String
    },
    decription: {
        type: String
    },
    feature: {
        interior: {
            icon: {
                type: String
            },
            featureName: {
                type: String
            }
        },
        vehicle: {
            icon: {
                type: String
            },
            featureName: {
                type: String
            }
        },
        technical: {
            icon: {
                type: String
            },
            featureName: {
                type: String
            }
        },
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('cars', carSchema);