const mongoose = require('mongoose');

const stripeAccountSchema = mongoose.Schema({
    dealerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'dealers', 
    },
    stripeAccountId: {
        type: String
    },
    object: {
        type: String
    },
    country: {
        type: String
    },
    default_currency: {
        type: String
    },
    type: {
        type: String
    },
    loginLink: {
        type: String
    },
    onBoardingLink: {
        type: String
    } 
},
{
    timestamps: true
});

module.exports = mongoose.model('stripeAccounts', stripeAccountSchema);