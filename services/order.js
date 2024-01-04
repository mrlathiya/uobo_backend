const orderModel = require('../models/order');

module.exports = {
    addOrder: async (params) => {
        const orderData = await new orderModel({
            customerId: params.customerId,
            carId: params.carId,
            paymentId: params.paymentId,
            status: params.status
        });
        
        if (orderData) {
            return orderData.save();
        } else {
            return undefined;
        }
    }
}