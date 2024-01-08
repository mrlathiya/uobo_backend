const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cars',
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'payments',
    },
    status: {
        type: String
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('orders',orderSchema);