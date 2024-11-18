const dealerServices = require('../services/dealer');
const carServices = require('../services/car');
const userServices = require('../services/user');
const awsServices = require('../config/aws-services');
const sendNotification = require('../config/send-notification');
const financeService = require('../services/finance');
const { parse } = require('csv-parse');
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

const convertLondonAutoValleyCsvToJson = async (csvFile, dealerId) => {
    const csvData = csvFile.buffer.toString('utf-8');

    const records = await new Promise((resolve, reject) => {
        parse(csvData, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        }, (err, output) => {
            if (err) reject(err);
            else resolve(output);
        });
    });

    const cleanHTML = (text) => text.replace(/<\/?(p|div|br|span|a)>/gi, '').trim();
    const cleanURL = (url) => url.replace(/<\/?[^>]+(>|$)/g, '').trim();

    const dealer = await dealerServices.getDealerByDealerId(dealerId);

    let address;

    if (dealer) {
        if (dealer?.address?.address1) {
            address = dealer?.address?.address1;

            if (dealer?.address?.address1?.address2) {
                address = dealer?.address?.address1?.address2;
            }
        }
    }

    const dbPromises = records.map(async row => {
        const fullRow = Object.values(row).join(' ');
        const urlPattern = /https?:\/\/[^\s"']+/g;
        const allUrls = fullRow.match(urlPattern) || [];
        const cleanedUrls = allUrls.map(cleanURL);

        let carFAXLink = '';
        let mainPhoto = '';
        let extraPhotos = [];

        cleanedUrls.forEach(url => {
            if (url.includes('https://vhr.carfax.ca/?')) {
                carFAXLink = url;
            } else {
                extraPhotos.push(url);
            }
        });

        if (extraPhotos.length > 0) {
            const firstUrlSet = extraPhotos[0].split(',');
            mainPhoto = firstUrlSet[0];
            extraPhotos = [...firstUrlSet.slice(1), ...extraPhotos.slice(1)];
        }

        const rowData = {
            VIN: row['VIN'] || '',
            Stock_Number: row['STOCKNUMBER'] || '',
            New_or_Used: row['INVENTORYTYPE'] || '',
            MSRP: row['MSRP'] ? row['MSRP'] : row['PURCHASEPRICE'] || row['SALEPRICE'] || '',
            Year: row['YEAR'] || '',
            Make: row['MAKE'] || '',
            Model: row['MODEL'] || '',
            Body_Style: row['BODYSTYLE'] || '',
            Series: row['TRIM'] || '',
            Exterior_Colour: row['EXTCOLOUR'] || '',
            Interior_Colour: row['INTCOLOUR'] || '',
            Trim: row['TRIM'] || '',
            Engine_Size: row['ENGINE'] || '',
            Cylinder_Count: row['CYLINDERS'] || '',
            Door_Count: row['DOORS'] || '',
            Drive_configuration: row['DRIVETYPE'] || '',
            Additional_Options: cleanHTML(row['OPTIONS'] || ''),
            Current_Miles: row['ODOMETER'] || '',
            Date_Added_to_Inventory: row['INSTOCKDATE'] || '',
            Status: row['STATUS'] || '',
            Fuel_Type: row['FUELTYPE'] || '',
            Vehicle_Location: row['LOCATION'] ? row['LOCATION'] : address,
            Certified_Pre_owned: row['ISCERTIFIED'] === 'True',
            Price: row['SALEPRICE'] || '',
            Transmission_Description: row['TRANSMISSIONTYPE'] || '',
            Internet_Description: cleanHTML(row['DESCRIPTION'] || ''),
            Vehicle_Class: row['CATEGORY'] || '',
            Main_Photo: mainPhoto,
            Main_Photo_Last_Modified_Date: '',
            Extra_Photos: extraPhotos.join(';'),
            Extra_Photo_Last_Modified_Date: '',
            carFAXLink: carFAXLink,
            dealerId: dealerId,
            image360URL: mainPhoto,
        };

        await addCSVRawToDB(rowData, dealerId);
        return rowData;
    });

    const jsonData = await Promise.all(dbPromises);
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

                if (token) {

                    if (csvFile) {
                        let dealerInventory = await convertCsvToJson(csvFile, registerDealerData._id);

                        if (dealerInventory) {
                            return res.status(200).json({ 
                                IsSuccess: true, 
                                Data: [registerDealerData], 
                                Inventory: dealerInventory,
                                token,
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

    checkToken: async (req, res, next) => {
        try {
            const dealer = req.user;

            if (dealer) {
                return res.status(200).json({ IsSuccess: true, Data: [dealer], Message: 'Dealer token valid' })
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer token not valid' })
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    editDealerFcmToken: async (req, res, next) => {
        try {
            const params = req.body;

            if (params.dealerId === '' || params.dealerId === undefined || params.dealerId === null) {
                return res.status(400).json({ IsSuccess: false, Message: 'Please pass dealerId for the FCM Token' });
            }

            // if (params.fcmToken === '' || params.fcmToken === undefined || params.fcmToken === null) {
            //     return res.status(400).json({ IsSuccess: false, Message: 'Please pass FCM Token' });
            // }

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
                const unreadNotificationCount = notifications.filter(noti => !noti.isRead).length;
                return res.status(200).json({ 
                    IsSuccess: true,
                    Count: notifications.length,
                    UnReadCount: unreadNotificationCount,
                    Data: notifications, 
                    Message: 'Dealer notifications found' 
                });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'No dealer notifications found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    markAsReadNotification: async (req, res) => {
        try {
            const params = req.body;
            const dealer = req.user;

            if (params.markAsReadAll) {
                const editNoti = await dealerServices.editDealerAllNotificationAsRead(dealer._id);

                if (editNoti) {
                    return res.status(200).json({ IsSuccess: true, Data: editNoti, Message: 'All notifications mark as read' });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Notifications are not mark as read' });
                }
            } else if (params.notificationId) {
                const editNoti = await dealerServices.editNotificationStatusAsRead(params.notificationId);

                if (editNoti) {
                    return res.status(200).json({ IsSuccess: true, Data: editNoti, Message: 'Notification mark as read' });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Notification not mark as read' });
                }
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide valid parameters notificationId or markAsReadAll' });
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

    createDealerStripeConnectedAccount: async(req, res, next) => {
        try {

            const dealerId = req.body.dealerId;

            const stripe = Stripe(process.env.STRIPE_SECRET);

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

            if (account != null) {
                
                const accountLink = await stripe.accountLinks.create({
                    account: account.id,
                    refresh_url: 'https://app.uobo.ca/retry-stripe-onboarding',
                    return_url: 'https://app.uobo.ca/dealer-dashboard',
                    type: 'account_onboarding',
                });
                
                const stripeAccountLinks = await dealerServices.createDealerStripeAccount(account, accountLink, dealerId);

                return res.status(200).json({ IsSuccess: true, Data: [account, stripeAccountLinks], Message: 'Dealer Stripe Account Created' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer Stripe Account Not Created' });
            }
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
    },

    retriveDealerStripeAccount: async (req, res, next) => {
        try {
            // Retrieve the connected account details

            const dealer = req.user;
            const stripe = Stripe(process.env.STRIPE_SECRET);

            let stripeDetails = await dealerServices.getDealerStripeOnBoardingLink(dealer._id);

            if (stripeDetails) {

                const account = await stripe.accounts.retrieve(stripeDetails.stripeAccountId);
        
                // Check if onboarding is complete
                const isOnboardingComplete = account.details_submitted && account.charges_enabled && account.payouts_enabled;
            
                const account_deatils = {
                    isOnboardingComplete: isOnboardingComplete,
                    details_submitted: account.details_submitted,
                    charges_enabled: account.charges_enabled,
                    payouts_enabled: account.payouts_enabled,
                    account: stripeDetails,
                };
                return res.status(200).json({ IsSuccess: true, Data: account_deatils, Message: 'Dealer stripe details found' });
            } else {
                const account_deatils = {
                    isOnboardingComplete: false,
                    details_submitted: false,
                    charges_enabled: false,
                    payouts_enabled: false,
                    account: {},
                    newUser: true
                };
                return res.status(200).json({ IsSuccess: false, Data: account_deatils, Message: 'Dealer stripe details not found' });
            }
        
        } catch (error) {
            console.error('Error retrieving account:', error);
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    updateDealerInventory: async (req, res, next) => {
        try {
            const csvFile = req.file;
            const dealerId = req.body.dealerId;

            if (csvFile) {
                let inventory_data = await convertCsvToJson(csvFile, dealerId);

                return res.status(200).json({ IsSuccess: true, Data: inventory_data, Message: 'Inventory updated successfully' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Inventory not updated' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    updateAutoTradeInventory: async (req, res, next) => {
        try {
            const csvFile = req.file;
            const dealerId = req.body.dealerId;

            if (csvFile) {
                let inventory_data = await convertAutoTradeCsvToJson(csvFile, dealerId);

                return res.status(200).json({ IsSuccess: true, Data: inventory_data, Message: 'Inventory updated successfully' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Inventory not updated' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    updateLondonAutoValleyInventory: async (req, res, next) => {
        try {
            const csvFile = req.file;
            const dealerId = req.body.dealerId;

            if (csvFile) {
                let inventory_data = await convertLondonAutoValleyCsvToJson(csvFile, dealerId);

                return res.status(200).json({ IsSuccess: true, Data: inventory_data, Message: 'Inventory updated successfully' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Inventory not updated' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    deleteDealerStripeAccount: async (req, res, next) => {
        try {
            const dealer = req.user;

            if (dealer) {
                const removeAccount = await dealerServices.deleteDealerStripeInformation(dealer._id);

                return res.status(200).json({ IsSuccess: true, Data: [], Message: 'Dealer stripe account remove' });
            } else {
                return res.status(200).json({ IsSuccess: false, Data: [], Message: 'Dealer not found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    deleteUnrelatedData: async (req, res) => {
        try {
            await dealerServices.deleteUnrelatedInventories();

            return res.send(true);
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    removeImageFromInventory: async (req, res) => {
        try {
            const { inventoryId, imageURL } = req.body;

            const updatedInventory = await dealerServices.deleteImagesFromInventory(inventoryId, imageURL);

            if (updatedInventory) {
                return res.status(200).json({ IsSuccess: true, Message: 'Image removed successfully' });
            } else {
                return res.status(400).json({ IsSuccess: false, Message: 'Inventory not found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    editInventory: async (req, res) => {
        try {
            const params = req.body;

            if (!params.inventoryId) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Missing inventoryId field' });
            }

            let getExistInventory = await carServices.getCarById(params.inventoryId);

            if (getExistInventory) {
                const updatedInventory = await dealerServices.editInventoryFields(params);

                if (updatedInventory) {
                    return res.status(200).json({ IsSuccess: true, data: updatedInventory, Message: 'Inventory car details edited successfully' });
                } else {
                    return res.status(400).json({ IsSuccess: false, Message: 'Inventory not found' });
                }
            } else {
                return res.status(400).json({ IsSuccess: false, Message: 'Inventory not found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    getAllDealerInventory: async (req, res) => {
        try {
            let inventoriesData = await dealerServices.getEntireInventory();

            if (inventoriesData.length) {
                return res.status(200).json({ 
                    IsSuccess: true, 
                    Count: inventoriesData.length, 
                    Data: inventoriesData, 
                    Message: 'Inventory Data found' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Inventory Data not found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    }
}