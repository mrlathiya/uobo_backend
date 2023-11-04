const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
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
        ref: 'cars',
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'payments',
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('orders',orderSchema);