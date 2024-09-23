const financeCashModel = require('../models/financeCashFlow');
const financeFixModel = require('../models/financeCarFix');
const financeWithoutCar = require('../models/financeWithoutCar');
const financeModel = require('../models/finance');
const mongoose = require('mongoose');

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
        const order = await financeModel.findById(orderId);

        return order;
    },

    getOrderByCustomerId: async (customerId) => {
        const order = await financeModel.find({customerId})
                                      .populate({
                                        path: "carId"
                                      })
                                      .populate({
                                        path: "customerId"
                                      });

        return order;
    },

    getOrderByDealerId: async(dealerId) => {
        // const orderFix = await financeFixModel.find({ dealerId }).populate({ path: 'carId' }).populate({ path: 'customerId' });
        // const orderCash = await financeCashModel.find({ dealerId }).populate({ path: 'carId' }).populate({ path: 'customerId' });
        // const orderWithoutCar = await financeWithoutCar.find({ dealerId }).populate({ path: 'carId' }).populate({ path: 'customerId' });
        const orders = await financeModel.find({ dealerId })
                                        .populate({ path: 'carId' })
                                        .populate({ path: 'customerId' })
                                        .populate({ path: 'customerSelectedCar.carId' })
                                        .populate({ path: 'EMIOptions' })
                                        .populate({ path: 'customerSelectedEMIOption' })
                                        .populate({ path: 'dealerProvidedOptions.carId' })
                                        .sort({ updatedAt: -1 });
        return orders;
    },

    getOrderByCustomerId: async(customerId, optionId) => {
        const orders = await financeModel.find({ customerId })
                                .populate({ path: 'carId' })
                                .populate({ path: 'dealerId' })
                                .populate({ path: 'customerSelectedCar.carId' })
                                .populate({ path: 'EMIOptions' })
                                .populate({ path: 'dealerProvidedOptions.carId' });

        return orders;
    },

    getAdminDashboardOrders: async() => {
        const orders = await financeModel.find()
                                .populate({ path: 'carId' })
                                .populate({ path: 'customerId' })
                                .populate({ path: 'dealerId' });

        return orders;
    },

    editOrderStatus: async (status, orderId) => {
        let update = {
            status
        };

        let updateOrder = await financeModel.findByIdAndUpdate(orderId, update, { new: true })
                                            .populate({
                                                path: 'customerId'
                                            })
                                            .populate({
                                                path: 'dealerId'
                                            })
                                            .populate({
                                                path: 'carId'
                                            });

        return updateOrder;
    },

    deleteCustomerOrder: async (orderId) => {
        return orderModel.findByIdAndDelete(orderId);
    }
}