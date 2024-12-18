const mongoose = require('mongoose');

const customerProcodeSchema = mongoose.Schema({
    promoCode: {
        type: String
    },
    businessOwner: {
        type: String
    },
    promoAmount: {
        type: Number
    },
    activationStatus: {
        type: Boolean,
        default: false
    },
    claimedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    }],
},
{
    timestamps: true
});

module.exports = mongoose.model('CustomerPromocode', customerProcodeSchema)