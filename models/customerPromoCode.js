const mongoose = require('mongoose');

const customerProcodeSchema = mongoose.Schema({
    mobileNumber: {
        type: String
    },
    promocode: {
        type: String
    },
    promoAmount: {
        type: String
    },
    claimStatus: {
        type: String
    },
    activationStatus: {
        type: String
    }
});

module.exports = mongoose.model('CustomerPromocode', customerProcodeSchema)