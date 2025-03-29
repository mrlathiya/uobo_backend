require("dotenv").config();
const userServices = require('../services/user');
const dealerServices = require('../services/dealer');
const financeServices = require('../services/finance');
const fs = require('fs');
const sendNotification = require('../config/send-notification');
const Stripe = require('stripe');
const nodemailer = require("nodemailer");

// Configure transporter (Use your email service credentials)
const transporter = nodemailer.createTransport({
    service: "gmail", // You can use any email provider like Outlook, Yahoo, etc.
    auth: {
      user: "uobo.drive@gmail.com",
      pass: "ciik azkw suor yxqd", // Use App Password if using Gmail
    },
});
  
// Function to send OTP
const sendOTP = async (email, otp) => {
    try {
      const mailOptions = {
        from: "uobo.drive@gmail.com",
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is: ${otp}`,
      };
  
      await transporter.sendMail(mailOptions);
      console.log("OTP sent successfully!");
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
};

const uploadedImage = async (base64Image, fileNameConst) => {
    const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
      
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 image string');
    }
    
    const fileFormat = matches[1];
    const base64Data = matches[2];
    
    // Remove the data:image/png;base64 part
    const dataBuffer = Buffer.from(base64Data, 'base64');
    
    // Generate a unique filename
    const fileName = `${fileNameConst}_${Date.now()}.${fileFormat}`;
    
    const filePath = `uploads/${fileName}`;
    
    // Save the image to the "uploads" folder
    fs.writeFile(filePath, dataBuffer, (err) => {
        if (err) {
        console.error(err);
        throw new Error('Error uploading image');
        } else {
        console.log('Image uploaded successfully');
        }
    });
    
    return fileName;
}

const deleteImage = async (fileName) => {
    const filePath = `uploads/${fileName}`;
  
    // Delete the image file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        throw new Error('Error deleting image');
      } else {
        console.log('Image deleted successfully');
      }
    });
}

module.exports = {
    userRegistration: async (req, res, next) => {
        try {
            const params = req.body;

            if (!params.email) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'User email is required' });
            }

            if (!params.countryCode) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Country code is required' });
            }

            if (!params.number) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Mobile number is required' });
            }

            let checkExistUserWithEmail = await userServices.getUserByEmail(params.email);

            if (checkExistUserWithEmail.length) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'User already exist with this email' });
            }

            let checkExistUser = await userServices.getUserByMobileNumber(params);

            if (checkExistUser.length) {
                return res.status(400).json({ 
                    IsSuccess: false, Data: [], Message: 'User already exist with this contact information'
                });
            }

            const addUser = await userServices.registerUser(params);

            if (addUser) {
                // const otp = Math.floor(100000 + Math.random() * 900000);
                // await sendOTP(params.email, otp);
                // await userServices.storeCustomerOTP(params.email, otp);
                return res.status(200).json({ IsSuccess: true, Data: [addUser], Message: 'User registered successfully' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'User not registered' });
            }    
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    signInUser: async (req, res, next) => {
        try {
            const params = req.query;

            // if (!params.countryCode) {
            //     return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Country code is required' });
            // }

            // if (!params.number) {
            //     return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Mobile number is required' });
            // }

            if (!params.email) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Email is required' });
            }

            if (!params.fcmToken) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'FCM Token is required' });
            }

            let checkExistUser = await userServices.getUserByEmail(params.email);

            if (checkExistUser.length === 1) {
                const userId = checkExistUser[0]._id;

                let customerFCMToken = await userServices.updateCustomerFCMToken(userId, params.fcmToken);

                if (customerFCMToken === undefined || customerFCMToken === null) {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'User FCM token not updated' });
                }
                
                let token = await userServices.createUserToken(userId);

                if (token) {
                    const otp = Math.floor(100000 + Math.random() * 900000);
                    await sendOTP(params.email, otp);
                    await userServices.storeCustomerOTP(params.email, otp);
                    return res.status(200).json({ IsSuccess: true, Data: checkExistUser, token, Message: 'User logged In...!!!' });
                } else {
                    return res.status(400).json({ IsSuccess: true, Data: [], Message: 'Token not created' });
                }
            } else {
                return res.status(400).json({ IsSuccess: true, Data: checkExistUser, token, Message: 'User not found' });
            }
            
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    generateOTP: async (req, res, next) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ message: "email is required" });
            }

            const existCustomer = await userServices.getUserByEmail(email);

            if (existCustomer.length) {
                // Generate 6-digit OTP
                const otp = Math.floor(100000 + Math.random() * 900000);

                if (existCustomer[0].email) {
                    const email = existCustomer[0].email;
                    await sendOTP(email, otp);
                    await userServices.storeCustomerOTP(email, otp);
                    return res.status(200).json({ IsSuccess: true, Message: "OTP sent successfully" });
                } else {
                    return res.status(200).json({ IsSuccess: false, Message: "Customer Email not found" });
                }
                
            } else {
                return res.status(404).json({ IsSuccess: false, Message: "User not found" });
            }

        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    customerOTPVerification: async (req, res, next) => {
        try {
            const { email, OTP } = req.body;

            if (!email) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'email is required' });
            }

            if (!OTP) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'OTP is required' });
            }

            const existCustomer = await userServices.getUserByEmail(email);

            if (existCustomer.length) {
                if (existCustomer[0]?.verificationOTP === OTP) {
                    const customerId = existCustomer[0]?._id;
                    const verificationStatus = await userServices.verifyCustomer(customerId);
    
                    if (verificationStatus) {
                        return res.status(200).json({ IsSuccess: true, Data: verificationStatus, Message: "Verified successfully" })
                    } else {
                        return res.status(200).json({ IsSuccess: false, Data: [], Message: "Verified failed" });
                    }
                } else {
                    return res.status(200).json({ IsSuccess: false, Data: [], Message: "Wrong OTP..!! Please enter correct OTP" });
                }
            } else {
                return res.status(404).json({ IsSuccess: false, Message: "User not found" });
            }

        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    getUser: async (req, res, next) => {
        try {
            const userId = req.params.id;

            let user = await userServices.getUserById(userId);

            if (user) {
                return res.status(200).json({ IsSuccess: true, Data: user, Message: 'User details found' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'User details not found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    editUserProfile: async (req, res, next) => {
        try {
            const params = req.body;

            const user = req.user;

            if (!user) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide valid authrized token' });
            }

            params.userId = user._id;

            let editProfile = await userServices.updateUserProfileInformation(params);

            if (editProfile) {
                return res.status(200).json({ IsSuccess: true, Data: editProfile, Message: 'User Profile Updated' });
            } else {
                return res.status(400).json({ IsSuccess: true, Data: [], Message: 'User Profile Not Updated' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    getAllUsers: async (req, res, next) => {
        try {
            let users = await userServices.getAllUsers();

            if (users.length) {
                return res.status(200).json({ IsSuccess: true, Count: users.length, Data: users, Message: 'All users found' }); 
            } else {
                return res.status(400).json({ IsSuccess: true, Data: [], Message: 'No users found' }); 
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },
    
    userVerification: async (req, res, next) => {
        try {
            const params = req.body;
            const user = req.user;

            if (!user) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide valid authrized token' });
            }

            params.userId = user._id;

            if (!params.dl_front_image) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide DL Front image (dl_front_image)' });
            }

            if (!params.dl_back_image) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide DL Back image (dl_back_image)' });
            }

            if (params.isVerify === undefined || params.isVerify === null || params.isVerify === '') {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide isVerify boolean parameter' });
            }

            let addDLFront = await uploadedImage(params.dl_front_image, user.firstName);
            let addDLBack = await uploadedImage(params.dl_back_image, user.firstName);

            if (addDLFront && addDLBack) {
                params.dl_front_image = addDLFront;
                params.dl_back_image = addDLBack;
                let verifyUser = await userServices.verifyUserLicence(params);

                if (verifyUser) {
                    return res.status(200).json({ IsSuccess: true, Data: [verifyUser], Message: 'User licence details updatded' });
                } else {
                    if (addDLFront) {
                        await deleteImage(addDLFront);
                    }

                    if (addDLBack) {
                        await deleteImage(addDLBack);
                    }
                    return res.status(400).json({ IsSuccess: true, Data: [], Message: 'User licence details not updatded' });
                }
            } else {
                return res.status(400).json({ IsSuccess: true, Data: [], Message: 'User licence image not uploaded' });
            }

        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    updateUserLocation: async (req, res, next) => {
        try {
            const params = req.body;
            const user = req.user;

            if (!user) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide valid authrized token' });
            }

            params.userId = user._id;

            if (!params.lat) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please pass lat required parameter' });
            }

            if (!params.long) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please pass long required parameter' });
            }

            let userLocation = await userServices.editUserCurrentLocation(params);

            if (userLocation) {
                return res.status(200).json({ IsSuccess: true, Data: [userLocation], Message: "User location updated" });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: "User location not updated" });
            }

        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    collectUserEmail: async (req, res, next) => {
        try {
            const email = req.body.email;

            if (!email ) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Country code is required' });
            }

            let addEmail = await userServices.addUserEmail(email);

            if (addEmail !== undefined && addEmail !== null) {
                return res.status(200).json({ IsSuccess: true, Data: addEmail, Message: 'Email added' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Email not added' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    createStripePayment: async (req, res, next) => {
        try {
            const { amount, dealerId, customerId, requestType } = req.body;

            let stripe = Stripe(process.env.STRIPE_SECRET);

            if (requestType === 'test') {
                stripe = Stripe(process.env.STRIPE_SECRET);
            }

            if (!dealerId) {
                return res.status(400).json({ IsSuccess: false, Message: 'Dealer Id is required' })
            }

            let getDealerStripeAccount = await dealerServices.getDealerStripeAccountByDealerId(dealerId);

            // let amounIs = amount
            const amountInCents = Math.round(amount * 100);

            // Calculate commission and net amount
            const commission = amount * 0.05;
            const netAmount = amount - commission;

            const commissionInCents = Math.round(amountInCents * 0.05);

            // Calculate the net amount for the destination account (95% of the amount)
            const netAmountInCents = amountInCents - commissionInCents;

            // Create a PaymentIntent with the total amount
            const paymentIntent = await stripe.paymentIntents.create({
                amount: netAmountInCents,
                currency: 'cad',
                application_fee_amount: commissionInCents,
                transfer_data: {
                    destination: getDealerStripeAccount?.stripeAccountId ? getDealerStripeAccount?.stripeAccountId : 'acct_1NECetLTrUb0toUo',
                  },
                metadata: { dealerId, commission, netAmount, customerId }
            });

            return res.send({
                clientSecret: paymentIntent.client_secret,
            });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    transferStripePayment: async (req, res, next) => {
        const { amount, destinationAccountId, requestType } = req.body;
        try {

            let stripe = Stripe(process.env.STRIPE_SECRET);

            if (requestType === 'test') {
                stripe = Stripe(process.env.STRIPE_SECRET);
            }

            const transfer = await stripe.transfers.create({
                amount,
                currency: 'cad',
                destination: destinationAccountId,
            });

            res.send({
                transfer,
            });
        } catch (error) {
            res.status(500).send({
            message: error.message,
            });
        }
    },

    sendAlertForPaymentProcessCompletion: async (req, res, next) => {
        try {
            let { customerId, dealerId, paymentStatus, amount, orderId } = req.body;

            let customer = await userServices.getUserById(customerId);
            let dealer = await dealerServices.getDealerByDealerId(dealerId);
            let order = await financeServices.getFinanceById(orderId);

            if (customer && dealer) {
                if (customer) {
                    let title = `Stripe payment ${paymentStatus}`;
                    if (order.category === 'Cash') {
                        title = `Stripe payment ${paymentStatus} Cash`;
                    }
                    let body = `Stripe payment of ${amount} is ${paymentStatus}`;
                    await sendNotification.sendFirebaseNotification(customer.fcmToken, title, body, 'Stripe Payment', 'stripePayment', dealer._id, customer._id, true);
                    return res.status(200).json({ IsSuccess: true, Data: true, Message: 'Payment alert send' });
                }
    
                if (dealer) {
                    let title = `Payment from customer ${customer.firstName}`;
                    if (order.category === 'Cash') {
                        title = `Stripe payment ${paymentStatus} Cash`;
                    }
                    let body = `Payment from customer ${customer.firstName} of ${amount} is ${paymentStatus}`;
                    await sendNotification.sendFirebaseNotification(dealer.fcmToken, title, body, 'Stripe Payment', 'stripePayment', customer._id, dealer._id, false);
                    return res.status(200).json({ IsSuccess: true, Data: true, Message: 'Payment alert send' });
                }
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Customer or Dealer not found' });
            }

        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    sendNoti: async (req, res, next) => {
        try {
            let { token, title, body } = req.query;

            let data = await sendNotification.sendFirebaseNotification(token, title, body, '', 'testing', undefined, '66c22d3fb25f629f8f050972', false);

            return res.send(data);
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    listenToPaveEvent: async (req, res, next) => {
        try {
            const payload = req.body;

            if (payload?.session?.options?.sms?.to) {
                
                let contactNumberIs = payload?.session?.options?.sms?.to;

                let contactNumber = contactNumberIs.slice(2);

                if (contactNumber) {
                    let user = await userServices.getUserByContactNumber(contactNumber);

                    if (user) {
                        const editPaveReportToCustomer = await userServices.updatePaveURLInCustomer(user._id, payload.landing_page);
                        let customerOrders = await financeServices.getCustomerOrderByPaveSessionKey(user._id, payload?.session?.session_key);

                        if (customerOrders.length) {

                            let orders = await financeServices.editPaveReportURLToCustomerOrders(customerOrders, payload.landing_page);

                            let dealerContactNumber = payload?.session?.options?.sms?.from;
                            
                            let dealerIs = await dealerServices.getDealerByContactNumber(dealerContactNumber);

                            if (user.fcmToken) {
                                let title = 'Thank you for submitting Trade In Car';
                                let body = `Please wait while we get the best evaluation from ${dealerIs?.firstName ? dealerIs?.firstName : 'dealer'} and further order updates`;

                                await sendNotification.sendFirebaseNotification(user.fcmToken, title, body, '', 'PaveReportNotificationToCustomer',dealerIs?._id, user._id, true);
                            }

                            dealerContactNumber = dealerContactNumber.slice(2) ? dealerContactNumber.slice(2) : dealerContactNumber;

                            if (dealerIs && dealerIs?.fcmToken) {
                                let title = `${user?.firstName} submitted trade in car.`;
                                let body = 'Evaluate the car and confirm the order availability now.';

                                await sendNotification.sendFirebaseNotification(dealerIs.fcmToken, title, body, '', 'PaveReportNotificationToDealer',user._id, dealerIs?._id, false);
                            }

                            return res.status(200).json({ 
                                IsSuccess: true, 
                                Count: orders.length, 
                                Data: orders, 
                                Message: 'Customer orders found' });
                        } else {
                            return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Customer orders not found' });
                        }
                    } else {
                        return res.status(400).json({ IsSuccess: false, Data: [], Message: 'User not found' });
                    }
                    
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'User not found' });
                }
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'User not found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    getUserNotifications: async (req, res, next) => {
        try {
            const customerId = req.query.userId;

            if (customerId === undefined || customerId === null || customerId === '') {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'CustomerId is required' });
            }

            let customer = await userServices.getUserById(customerId);

            if (customer) {
                let notificationIs = await userServices.getCustomerNotifications(customer._id);

                if (notificationIs.length) {
                    return res.status(200).json({ 
                        IsSuccess: true, 
                        Count: notificationIs.length, 
                        Data: notificationIs, 
                        Message: 'Customer notifications found' });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Empty notifications' });
                }

            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'No customer found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    editCustomerLicenceVerification: async(req, res, next) => {
        try {
            const { customerId } = req.body;

            if (customerId === undefined && customerId === null && customerId === '') {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Customer id is required parameters'});
            }

            let editCustomerLicence = await userServices.customerLicenceVerification(customerId, true);

            if (editCustomerLicence) {
                return res.status(200).json({ IsSuccess: true, Data: [editCustomerLicence], Message: 'Customer licence verified' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Customer licence not verified or customer not found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    deleteCustomer: async (req, res, next) => {
        try {
            const { customerNumber, deletionReason } = req.body;

            if (!customerNumber) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Customer number is required' });
            }

            if (!deletionReason) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Customer account deletion reason required' });
            }

            let checkExistUser = await userServices.getUserByContactNumber(customerNumber);

            if (checkExistUser) {
                const deleteCustomerIs = await userServices.deleteCustomerAndOrder(checkExistUser, deletionReason);

                if (deleteCustomerIs) {
                    return res.status(200).json({ IsSuccess: true, Data: deleteCustomerIs, Message: 'Customer and customer order deleted' });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Customer deletion operation failed' });
                }
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'No customer found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    addUserPreferences: async (req, res) => {
        try {
            const params = req.body;
            const customer = req.user;

            if (!customer) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'No customer found' });
            }

            params.customerId = customer._id;
            params.email = customer.email;
            params.contact = customer.contact;

            let checkExistPreference = await userServices.getCustomerPreferenceByCustomerId(customer._id);

            if (checkExistPreference.length === 1) {
                let editedPreference = await userServices.updateCustomerExistPreferene(params, checkExistPreference[0]._id);

                if (editedPreference) {
                    return res.status(200).json({ IsSuccess: true, Data: [editedPreference], Message: 'Customer Preference updated' });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Customer Preference not updated' });
                }
            }

            const addPreferences = await userServices.addCustomerPreferenceInformation(params);

            if (addPreferences) {
                return res.status(200).json({ IsSuccess: true, Data: [addPreferences], Message: 'Customer Preference added' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Customer Preference not added' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    getUserPreference: async (req, res) => {
        try {
            const customer = req.user;

            if (!customer) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'No customer found' });
            }

            const preferences = await userServices.getCustomerPreferenceByCustomerId(customer._id);

            if (preferences.length) {
                return res.status(200).json({ 
                    IsSuccess: true, 
                    Count: preferences.length, 
                    Data: preferences, 
                    Message: 'Customer preferences found' 
                });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Customer preferences not found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error });
        }
    },

    addCustomerPromocode: async (req, res) => {
        try {
            const params = req.body;

            if (!params.promoCode) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Promocode is require parameter' });
            }

            const existPromocode = await userServices.getCustomerExistPromocode(params.promoCode);

            if (existPromocode) {
                return res.status(200).json({ IsSuccess: true, Data: [existPromocode], Message: 'User already have unclaimed promocode' });
            } else {

                let addPromocode = await userServices.addNewPromocode(params);

                if (addPromocode) {
                    return res.status(200).json({ IsSuccess: true, Data: [addPromocode], Message: 'Promocode added' });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Promocode not added' });
                }
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    getCustomerPromocode: async (req, res) => {
        try {

            let promocodes = await userServices.getAllPromocode();

            if (promocodes.length) {
                return res.status(200).json({ IsSuccess: true, Count: promocodes.length , Data: promocodes, Message: 'Promocodes found' })
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Promocodes not found' })
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    activePromocode: async (req, res) => {
        try {
            const promocodeId = req.body.promocodeId;

            const editPromocodeStatus = await userServices.editPromocodeActivationStatus(promocodeId);

            if (editPromocodeStatus) {
                return res.status(200).json({ IsSuccess: true, Data: editPromocodeStatus, Message: 'Promocode is activated' })
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Promocode not activated' })
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    editCustomerPromocode: async (req, res) => {
        try {
            const params = req.body;
            const user = req.user;

            let existPromocode = await userServices.getCustomerRedeemedPromocode(user._id, params.promoCode); 

            if (!existPromocode) {
                const editPromocode = await userServices.updatePromocodeStatus(user._id, params.promoCode);

                if (editPromocode) {
                    return res.status(200).json({ IsSuccess: true, Data: editPromocode, Message: 'Promocode is updated' });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'No such a active promocode found' });
                }
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Customer already redeemed promocode' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    }
}