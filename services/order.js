const orderModel = require('../models/order');

module.exports = {
    addOrder: async (params) => {
        const orderData = await new orderModel({
            customerId: params.customerId,
            carId: params.carId,
            paymentId: params.paymentId !== "" && s.paymentId !== null ? params.paymentId : undefined,
            status: params.status
        });
        
        if (orderData) {
            return orderData.save();
        } else {
            return undefined;
        }
    },

    getOrderByOrderId: async (orderId) => {
        const order = await orderModel.findById(orderId);

        return order;
    },

    getOrderByCustomerId: async (customerId) => {
        const order = await orderModel.find({customerId})
                                      .populate({
                                        path: "carId"
                                      })
                                      .populate({
                                        path: "customerId"
                                      });

        return order;
    },

    editOrderStatus: async (status, orderId) => {
        let update = {
            status
        };

        let updateOrder = await orderModel.findByIdAndUpdate(orderId, update, { new: true });

        return updateOrder;
    },

    deleteCustomerOrder: async (orderId) => {
        return orderModel.findByIdAndDelete(orderId);
    }
}