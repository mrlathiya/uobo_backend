const orderServices = require('../services/order');
const sendNotification = require('../config/send-notification')

module.exports = {
    addNewOrder: async (req, res, next) => {
        try {
            const params = req.body;
            const user = req.user;

            if (!user) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide valid authrized token' });
            }

            if (!params.carId) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide valid carId' });
            }

            if (!params.status) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide valid status' });
            }

            params.customerId = user._id;

            const orderData = await orderServices.addOrder(params);

            if (orderData) {
                return res.status(200).json({ IsSuccess: true, Data: [orderData], Message: 'Order added' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Order not added' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    getCustomerOrdersv1: async (req, res, next) => {
        try {
            const user = req.user;

            if (!user) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide valid authrized token' });
            }

            const customerOrders = await orderServices.getOrderByCustomerId(user._id);

            if (customerOrders.length) {
                return res.status(200).json({ 
                    IsSuccess: true,
                    Count: customerOrders.length,
                    Data: customerOrders, Message: "Customer orders found"
                });
            } else {
                return res.status(400).json({ IsSuccess: true, Data: [], Message: "Customer orders not found" });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    getDealerOrders: async (req, res, next) => {
        try {
            const dealer = req.user;

            if (!dealer) {
                return res.status(401).json({ IsSuccess: false, Message: 'No dealer found' });
            }

            const orders = await orderServices.getOrderByDealerId(dealer._id);

            if (orders) {
                return res.status(200).json({ IsSuccess: true, Count: orders.length, Data: orders, Message: 'Dealer orders found' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer orders not found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    getCustomerOrders: async (req, res, next) => {
        try {
            const customer = req.user;

            if (!customer) {
                return res.status(401).json({ IsSuccess: false, Message: 'No customer found' });
            }

            const orders = await orderServices.getOrderByCustomerId(customer._id);

            if (orders.length) {
                return res.status(200).json({ 
                    IsSuccess: true, 
                    Count: orders.length, 
                    Data: orders, 
                    Message: 'Customer orders found' 
                });
            } else {
                return res.status(200).json({ IsSuccess: false, Data: [], Message: 'Customer orders not found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    getAllOrders: async (req, res, next) => {
        try {

            const orders = await orderServices.getAdminDashboardOrders();

            if (orders.length) {
                return res.status(200).json({ 
                    IsSuccess: true, 
                    Count: orders.length, 
                    Data: orders, 
                    Message: 'Admin orders found' 
                });
            } else {
                return res.status(200).json({ IsSuccess: false, Data: [], Message: 'No orders found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    editCustomerOrder: async (req, res, next) => {
        try {
            const orderId = req.params.id;
            const status = req.body.status;
            const user = req.user;

            if (!user) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide valid authrized token' });
            }

            if (!status) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide valid order status' });
            }

            const checkExistOrder = await orderServices.getOrderByOrderId(orderId);

            if (checkExistOrder) {
                let editOrder = await orderServices.editOrderStatus(status, orderId);

                if (editOrder) {
                    return res.status(200).json({ IsSuccess: true, Data: editOrder, Message: "Customer order status updated" });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: "Customer order status not updated" });
                }
            } else {
                return res.status(400).json({ IsSuccess: true, Data: [], Message: "No order found" });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    editOrderStatus: async (req, res, next) => {
        try {
            const orderId = req.body.orderId;
            const status = req.body.status;

            // if (!user) {
            //     return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide valid authrized token' });
            // }

            if (status === undefined && status === null) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide valid order status' });
            }

            const checkExistOrder = await orderServices.getOrderByOrderId(orderId);

            if (checkExistOrder) {
                let editStatus = await orderServices.editOrderStatus(status, orderId);

                if (editStatus) {

                    let title = '';
                    let content = '';
                    let customerIs = editStatus?.customerId;
                    let dealerIs = editStatus?.dealerId;
                    let carIs = editStatus?.carId;
                    let isCustomerAlert = false;

                    //dealer
                    if (status === 'CustomerSentAdditionalDocs') {
                        title = `${customerIs?.firstName} ${customerIs?.lastName} has sent additional documents`;
                        content = `Review them now and take action`;
                    }
                    
                    if (status === 'CustomerPaidFullInCashAndChooseTime' || status === 'CustomerBookedAppointment') {
                        title = `${customerIs?.firstName} ${customerIs?.lastName} choose delivery date`;
                        content = `Confirm it now and send bill of sale to ${customerIs?.firstName}`;
                    }

                    if (status === 'CustomerSignedBillOfSale') {
                        title = `${customerIs?.firstName} ${customerIs?.lastName} has signed bill of sale`;
                        content = `Review it now and prepare for dispatch ${carIs?.Make} ${carIs?.Model}`;
                    }

                    if (status === 'DepositPaidByCustomer') {
                        title = `${customerIs?.firstName} ${customerIs?.lastName} has paid downpayment for the car ${carIs.Make} ${carIs.Model}`;
                        content = `Send ${customerIs?.firstName} EMI options and delivery date`;
                    }

                    if (status === 'CustomerSelectEMIOptionAndChooseTime') {
                        title = `${customerIs?.firstName} ${customerIs?.lastName} has selected EMI option and chose delivery date`;
                        content = `Confirm it now and send bill of sale to ${customerIs?.firstName} `;
                    }

                    //customer
                    if (status === 'AdditionalDocumentAskedFromDealer') {
                        title = `${dealerIs?.firstName} has asked for few additional documents`;
                        content = `Send them now to speed up your order`;
                        isCustomerAlert = true;
                    }

                    if (status === 'DealerSentAvailability') {
                        title = `${dealerIs?.firstName} has confirmed car availability`;
                        content = `Make a payment and choose delivery date to secure your ${carIs?.Make} ${carIs?.Model}`;
                        isCustomerAlert = true;
                    }

                    if (status === 'DealerSentBillOfSale') {
                        title = `${dealerIs?.firstName} has sent bill of sale`;
                        content = `Let's close the deal`;
                        isCustomerAlert = true;
                    }

                    if (status === 'DealerSentEMIOptions') {
                        title = `${dealerIs?.firstName} has sent EMI Options and appointment availability`;
                        content = `Choose EMI option and confirm delivery date now`;
                        isCustomerAlert = true;
                    }

                    console.log(title)
                    console.log(content)
                    console.log(status)
                    // console.log(customerIs)
                    // console.log(dealerIs)
                    // console.log(carIs)

                    if (isCustomerAlert) {
                        await sendNotification.sendFirebaseNotification(customerIs?.fcmToken,title, content, 
                            null, 'OrderStatusEditedByAdminForCustomer', dealerIs?._id, 
                            customerIs._id, true);
                    } else {
                        console.log(dealerIs?.fcmToken)
                        await sendNotification.sendFirebaseNotification(dealerIs?.fcmToken,title, content, 
                            null, 'OrderStatusEditedByAdminForDealer', customerIs?._id, 
                            dealerIs._id, false);
                    }



                    return res.status(200).json({ IsSuccess: true, Data: editStatus, Message: "Order status updated by admin" });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: "Order status not updated" });
                }
            } else {
                return res.status(400).json({ IsSuccess: true, Data: [], Message: "No order found" });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    deleteOrder: async (req, res, next) => {
        try {
            const orderId = req.params.id;

            const user = req.user;

            if (!user) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide valid authrized token' });
            }

            let deleteOrder = await orderServices.deleteCustomerOrder(orderId);

            if (deleteOrder) {
                return res.status(200).json({ IsSuccess: true, Data: 1, Message: "Order deleted successfully" });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: 0, Message: "Order not found" });
            }

        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    }
}