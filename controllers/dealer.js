const dealerServices = require('../services/dealer');
const carServices = require('../services/car');
const userServices = require('../services/user');
const awsServices = require('../config/aws-services');
const sendNotification = require('../config/send-notification');
const financeService = require('../services/finance');
const fs = require('fs');
const path = require('path');
const dealer = require('../models/dealer');
const Stripe = require('stripe');

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

const convertCsvToJson = async (csvFile, dealerId) => {
    const jsonData = [];
    const csvData = csvFile.buffer.toString('utf-8');

    const rows = csvData.trim().split('\n');
    const headers = rows[0].split(',').map(header => header.replace(/"/g, '').trim());

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(',');
        const rowData = {};

        // Skip empty rows
        if (row.every(field => field.trim() === '')) {
            continue;
        }

        for (let j = 0; j < headers.length; j++) {
            // Replace spaces with underscores and trim any extra underscores from the keys
            let cleanedKey = headers[j].replace(/\s+/g, '_').replace(/_+$/, '');

            // Remove double quotes from values and trim whitespace/newlines
            const cleanedValue = row[j].replace(/"/g, '').trim();

            // Handle special cases for key names
            if (cleanedKey === 'New/Used') {
                cleanedKey = 'New_or_Used';
            }

            if (cleanedKey === 'Certified_Pre-owned') {
                cleanedKey = 'Certified_Pre_owned';
            }

            rowData[cleanedKey] = cleanedValue;
        }

        jsonData.push(rowData);

        await addCSVRawToDB(rowData, dealerId);
    }

    return jsonData;
};


const addCSVRawToDB = async (dataRow, dealerId) => {
    try {
        if (dataRow !== undefined && dataRow !== null) {
            const VINNumber = dataRow.VIN;
            const checkExist = await carServices.getCarByVIN(VINNumber);

            if (checkExist.length) {
                let inventoryId = checkExist[0]._id;
                const updateCarDetails = await carServices.editCarDetails(dataRow, dealerId, inventoryId);
            } else {
                const addCarDetails = await carServices.addNewCar(dataRow, dealerId);
            }
        }    
    } catch (error) {
        return error.message;
    }

}

const uploadCsvFile = async (base64Csv, fileNameConst) => {
    const matches = base64Csv.match(/^data:text\/csv;base64,(.+)$/);
      
    if (!matches || matches.length !== 2) {
        throw new Error('Invalid base64 CSV string');
    }
    
    const base64Data = matches[1];
    
    // Remove the data:text/csv;base64 part
    const dataBuffer = Buffer.from(base64Data, 'base64');
    
    // Generate a unique filename
    const fileName = `${fileNameConst}_${Date.now()}.csv`;
    
    const filePath = `uploads/${fileName}`;
    
    // Save the CSV file to the "uploads" folder
    fs.writeFile(filePath, dataBuffer, (err) => {
        if (err) {
            console.error(err);
            throw new Error('Error uploading CSV file');
        } else {
            console.log('CSV file uploaded successfully');
        }
    });
    
    return fileName;
}

module.exports = {
    addNewDealer: async (req, res, next) => {
        try {
            const params = req.body;
            const user = req.user;

            if (!user) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Unauthorized access' });
            }

            if (!params.name) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer name is required parameter' });
            }
            
            let addDealerDetails = await dealerServices.addDealer(params);

            if (addDealerDetails) {
                return res.status(200).json({ IsSuccess: true, Data: [addDealerDetails], Message: 'Dealer added successfully' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer not added' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    dealerRegistration: async (req, res, next) => {
        try {
            const params = req.body;

            if (!params.dealerShipName) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide dealerShipName' });
            }

            if (!params.firstName) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide firstName' });
            }

            if (!params.lastName) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide lastName' });
            }

            if (!params.OMVICLicenceLink) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide OMVICLicenceLink' });
            }

            if (!params.email) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide email parameter' });
            }

            if (!params.number) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide mobile number' });
            }

            let existDealer = await dealerServices.checkExistDealer(params.email, params.number);

            if (existDealer.length > 0) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer already exist with this email or phone number' });
            }

            let csvFile = req.file;

            let registerDealerData = await dealerServices.registerDealer(params);

            if (registerDealerData) {

                const token = await userServices.createUserToken(registerDealerData._id);

                let stripe = Stripe(process.env.STRIPE_SECRET);

                if (token) {

                    const account = await stripe.accounts.create({
                        country: 'CA',
                        type: 'express',
                        capabilities: {
                          card_payments: {
                            requested: true,
                          },
                          transfers: {
                            requested: true,
                          },
                        },
                    });

                    let accountLink;

                    if (account != null) {
                        
                        accountLink = await stripe.accountLinks.create({
                            account: account.id,
                            refresh_url: 'https://uobo.ca/',
                            return_url: 'https://uobo.ca/dealer-dashboard',
                            type: 'account_onboarding',
                        });
                        
                        await dealerServices.createDealerStripeAccount(account, accountLink, registerDealerData._id);
                    }

                    if (csvFile) {
                        let dealerInventory = await convertCsvToJson(csvFile, registerDealerData._id);

                        if (dealerInventory) {
                            return res.status(200).json({ 
                                IsSuccess: true, 
                                Data: [registerDealerData], 
                                Inventory: dealerInventory,
                                token,
                                StripeAccountOnBoardingLink: accountLink.url, 
                                Message: 'Dealer registration successfully' 
                            });
                        } else {
                            return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Something went wrong while uploading inventory' });
                        }
    
                    } else {
                        return res.status(200).json({ 
                            IsSuccess: true, 
                            Data: registerDealerData,
                            token,
                            StripeAccountOnBoardingLink: accountLink.url, 
                            Message: 'Dealer Register Successfully' 
                        });
                    }
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: "Dealer token not created" });
                }
                
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer not registered' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    dealerLogin: async (req, res, next) => {
        try {
            const params = req.body;

            let dealer = await dealerServices.loginDealer(params);

            // if (!params.fcmToken) {
            //     return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer FCM token is required' });
            // }

            if (dealer) {

                // if (params.fcmToken) {
                //     await dealerServices.updateDealerFCMToken(dealer._id, params.fcmToken);
                // }

                // let dealerToken = await dealerServices.updateDealerFCMToken(dealer._id, params.fcmToken);

                // if (dealerToken === undefined || dealerToken === null) {
                //     return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer FCM token is not updated' });
                // }

                const token = await userServices.createUserToken(dealer._id);

                if (token) {
                    return res.status(200).json({ IsSuccess: true, Data: {dealer, token}, Message: "Dealer LoggedIn" });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: "Dealer token not created" });
                }
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: "Dealer not found" });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    editDealerFcmToken: async (req, res, next) => {
        try {
            const params = req.body;

            if (params.dealerId === '' || params.dealerId === undefined || params.dealerId === null) {
                return res.status(400).json({ IsSuccess: false, Message: 'Please pass dealerId for the FCM Token' });
            }

            if (params.fcmToken === '' || params.fcmToken === undefined || params.fcmToken === null) {
                return res.status(400).json({ IsSuccess: false, Message: 'Please pass FCM Token' });
            }

            let updateDealerFcmToken = await dealerServices.updateDealerFCMToken(params.dealerId, params.fcmToken);

            if (updateDealerFcmToken) {
                return res.status(200).json({ IsSuccess: true, Data: updateDealerFcmToken, Message: 'Dealer FCM token updated' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer FCM token not updated' });
            }

        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    registerDealerFCMToken: async (req, res, next) => {
        try {
            const { fcmToken } = req.body;
            const dealer = req.user;

            if (!fcmToken) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide mobile countryCode' });
            }

            let dealerToken = await dealerServices.updateDealerFCMToken(dealer._id, fcmToken);

            if (dealerToken === undefined || dealerToken === null) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer FCM token is not updated' });
            } else {
                return res.status(200).json({ IsSuccess: true, Data: dealerToken, Message: 'Dealer FCM token updated' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },
    
    getDealer: async (req, res, next) => {
        try {
            const dealer = req.user;
            if (!dealer) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Unauthorized access' });
            }

            if (dealer) {

                let dealerInformation = await dealerServices.getNearByDealer(dealer);
                
                if (dealerInformation.length === 0) {
                    let dealerIs = await dealerServices.getNearByDealerData(dealer);

                    if (dealerIs) {
                        return res.status(200).json({ IsSuccess: true, Data: dealerInformation, Message: 'Dealer details found' });
                    } else {
                        return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer details not found' });
                    }

                } 
                
                return res.status(200).json({ IsSuccess: true, Data: dealerInformation, Message: 'Dealer details found' });
                
            } else {
                let dealers = await dealerServices.getAllDealers();

                if (dealers) {
                    return res.status(200).json({ IsSuccess: true, Data: dealers, Message: 'Dealers details found' });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealers details not found' });
                }
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    getAlldealerDetails: async (req, res, next) => {
        try {

            const dealers = await dealerServices.getAllDealers();

            if (dealers.length) {
                return res.status(200).json({ 
                    IsSuccess: true, 
                    Count: dealers.length, 
                    Data: dealers, 
                    Message: "All dealers found" 
                });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: "Dealers not found" });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    updateDealer: async (req, res, next) => {
        try {
            const params = req.body;
            const user = req.user;

            if (!user) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Unauthorized access' });
            }

            if (!params.dealerId) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'No dealerId found' });
            }

            let checkExistDealer = await dealerServices.getDealerByDealerId(params.dealerId);

            if (checkExistDealer) {
                let update = await dealerServices.editDealerDetails(params);

                if (update) {
                    return res.status(200).json({ IsSuccess: true, Data: [update], Message: 'Dealer details updated' });
                } else {
                    return res.status(400).json({ IsSuccess: true, Data: [], Message: 'Dealer details not updated' });
                }
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'No dealer found' });
            }

        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    deleteDealer: async (req, res, next) => {
        try {
            const dealerId = req.params.id;
            const user = req.user;

            if (!user) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Unauthorized access' });
            }

            if (!dealerId) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'No dealerId found' });
            }

            let checkExistDealer = await dealerServices.getDealerByDealerId(dealerId);

            if (checkExistDealer) {
                let deleteDealer = await dealerServices.deleteDealer(dealerId);

                return res.status(200).json({ IsSuccess: true, Data: [], Message: 'Dealer deleted' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'No dealer found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    addDealerRating: async (req, res, next) => {
        try {
            const params = req.body;
            const user = req.user;

            if (!user) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Unauthorized access' });
            }

            if (!params.dealerId) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer Id is required' });
            }

            let addRating = await dealerServices.addDealerRating(params, user);

            if (addRating !== undefined) {
                return res.status(200).json({ IsSuccess: true, Data: [addRating], Message: "Dealer rating added" });
            } else {
                return res.status(400).json({ IsSuccess: true, Data: [], Message: "Dealer rating not added" });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    getDealerRatings: async (req, res, next) => {
        try {
            const dealerId = req.params.id;
            const user = req.user;

            if (!user) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Unauthorized access' });
            }

            if (dealerId !== undefined && dealerId !== null && dealerId !== '') {
                let dealerRatings = await dealerServices.getDealerRating(dealerId);

                if (dealerRatings) {
                    return res.status(200).json({ IsSuccess: true, Data: [dealerRatings], Message: 'Dealer rating found' });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer rating not found' });
                }
            } else {
                let dealersRatings = await dealerServices.getAllDealerRating();

                if (dealersRatings) {
                    return res.status(200).json({ IsSuccess: true, Data: dealersRatings, Message: 'Dealers rating found' });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealers rating not found' });
                }
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    getDashboardDealerNotifications: async (req, res, next) => {
        try {
            const user = req.user;

            let notifications = await dealerServices.getDealerDashboardNotification(user._id);

            if (notifications.length) {
                return res.status(200).json({ IsSuccess: true, Data: notifications, Message: 'Dealer notifications found' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'No dealer notifications found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    getDocusignContent: async (req, res, next) => {
        try {
            const envelopeData = req.body;
            console.log(envelopeData);

            const envelopeId = envelopeData?.data?.envelopeId;
            const eventName = envelopeData?.event;

            if (envelopeId) {

                if (eventName === 'recipient-completed') {
                    const order = await financeService.editOrderByEnvelopeId(envelopeId);

                    let dealerId = order?.dealerId;
                    let customerId = order?.customerId;

                    let getDealer = await dealerServices.getDealerByDealerId(dealerId);
                    let getCustomer = await userServices.getUserById(customerId);
                    // let getCar = await userServices.getUserById(customerId);

                    if (getDealer.fcmToken) {
                        let token = getDealer.fcmToken;

                        let title = `${getCustomer.firstName} ${getCustomer.lastName} has signed bill of sale`;
                        let body = `Order Number: ${order?.financeOrderId}`;

                        await sendNotification.sendFirebaseNotification(token, title, body, '', '', getCustomer._id, getDealer._id, false);
                    }

                    if (getCustomer.fcmToken) {
                        let token = getCustomer.fcmToken;

                        let title = `Thank you for signing bill of sale`;
                        let body = `Order Number: ${order?.financeOrderId}`;

                        await sendNotification.sendFirebaseNotification(token, title, body, '', '', getDealer._id, getCustomer._id, true);
                    }
                }
                
            }

            return res.send('done');
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    getDealerStripeDetails: async (req, res, next) => {
        try {
            const dealer = req.user;

            // if (dealerId  === undefined || dealerId === null || dealerId === '') {
            //     return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer Id not found' });
            // }

            let stripeDetails = await dealerServices.getDealerStripeOnBoardingLink(dealer._id);

            if (stripeDetails) {
                return res.status(200).json({ IsSuccess: true, Data: [stripeDetails], Message: 'Dealer stripe details found' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer stripe details not found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    }
}