const mongoose = require('mongoose');

const customerProcodeSchema = mongoose.Schema({
    mobileNumber: {
        type: String
    },
    promocode: {
        type: String
    },
    promoAmount: {
        type: Number
    },
    claimStatus: {
        type: Boolean,
        default: false
    },
    activationStatus: {
        type: Boolean,
        default: false
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
},
{
    timestamps: true
});

module.exports = mongoose.model('CustomerPromocode', customerProcodeSchema)