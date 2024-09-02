const mongoose = require('mongoose');

const additionalCarServices = mongoose.Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    price: {
        type: Number
    },
    icon: {
        type: String,
        default: 'https://uobos3.s3.amazonaws.com/additional-services-icons/customer-support.png'
    },
    pricingType: {
        type: String
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('additionalCarServices', additionalCarServices)