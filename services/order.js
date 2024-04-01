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
                                        .populate({ path: 'dealerProvidedOptions.carId' });
        return orders;
    },

    getOrderByCustomerId: async(customerId, optionId) => {

        // let customerIdIs = new mongoose.Types.ObjectId(customerId);
    
        // let orders = await financeModel.aggregate([
        //     {
        //         $match: {
        //             customerId: customerIdIs
        //         }
        //     },
        //     // {
        //     //     $lookup: {
        //     //         from: 'users',
        //     //         localField: 'customerId',
        //     //         foreignField: '_id',
        //     //         as: 'customerInfo'
        //     //     }
        //     // },
        //     // {
        //     //     $lookup: {
        //     //         from: 'cars',
        //     //         localField: 'carId',
        //     //         foreignField: '_id',
        //     //         as: 'carInfo'
        //     //     }
        //     // },
        //     // {
        //     //     $lookup: {
        //     //         from: 'dealers',
        //     //         localField: 'dealerId',
        //     //         foreignField: '_id',
        //     //         as: 'dealerInfo'
        //     //     }
        //     // },
        //     // {
        //     //     $lookup: {
        //     //         from: 'dealers',
        //     //         localField: 'EMIOptions',
        //     //         foreignField: '_id',
        //     //         as: 'dealerInfo'
        //     //     }
        //     // },
        //     // {
        //     //     $unwind: '$options'
        //     // },
        // ]);

        const orders = await financeModel.find({ customerId })
                                .populate({ path: 'carId' })
                                .populate({ path: 'dealerId' })
                                .populate({ path: 'customerSelectedCar.carId' })
                                .populate({ path: 'EMIOptions' })
                                .populate({ path: 'dealerProvidedOptions.carId' });

        return orders;
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