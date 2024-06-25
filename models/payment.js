const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orders',
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customers',
    },
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'inventory',
    },
    price: {
        type: Number
    },
    deliveryCost: {
        type: Number
    },
    warrantyPlan: {
        type: String
    },
    tradeInValue: {
        type: String
    },
    taxes: {
        type: String
    },
    totalAmount: {
        type: String
    },
    status: {
        type: String
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('payments',paymentSchema);