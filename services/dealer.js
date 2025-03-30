const mongoose = require('mongoose');
const dealerSchema = require('../models/dealer');
const dealerRating = require('../models/dealerRating');
const stripeAccountSchema = require('../models/stripeAccount');
const notificationStorageSchema = require('../models/notificationStorage');
const inventorySchema = require('../models/car')

module.exports = {
    addDealer: async (params) => {
        let newDealer = await new dealerSchema({
            name: params.name,
            logo: params.logo,
            location: {
                lat: params.lat !== undefined && params.lat !== "" && params.lat !== null ? Number(params.lat) : undefined,
                long: params.long !== undefined && params.long !== "" && params.long !== null ? Number(params.long) : undefined
            }
        });

        if (newDealer !== null) {
            return newDealer.save();
        } else {
            return undefined;
        }
    },

    registerDealer: async (params) => {
        let newDealer = await new dealerSchema({
            dealerShipName: params.dealerShipName,
            address: params.address,
            OMVICLicenceLink: params.OMVICLicenceLink,
            firstName: params.firstName,
            lastName: params.lastName,
            email: params.email,
            address: {
                address1: params.address1 ? params.address1 : '',
                address2: params.address2 ? params.address2 : '',
                city: params.city ? params.city : '',
                state: params.state ? params.state : '',
                country: params.country ? params.country : '',
                postalcode: params.postalcode ? params.postalcode : '',
            },
            phoneNumber: {
                countryCode: '+1',
                number: params.number
            },
            companyRole: params.companyRole,
            numberOfLocation: params.numberOfLocation,
            delivery: {
                uoboDelivery: params.uoboDelivery,
                ownDeliveryStaff: params.ownDeliveryStaff,
            },
            logo: params.logo,
            customerPickUp: params.customerPickUp,
            location: {
                lat: params.lat !== undefined && params.lat !== "" && params.lat !== null ? Number(params.lat) : undefined,
                long: params.long !== undefined && params.long !== "" && params.long !== null ? Number(params.long) : undefined
            }
        });

        if (newDealer !== null) {
            return newDealer.save();
            // return newDealer;
        } else {
            return undefined;
        }
    },

    loginDealer: async (params) => {
        let dealer = await dealerSchema.findOne({ 
            phoneNumber:  {
                countryCode: '+1',
                number: Number(params.phoneNumber)
            } 
        });

        return dealer;
    },

    checkExistDealer: async (email, contactNumber) => {
        let dealer = await dealerSchema.find({
            $or: [
                { email },
                { 'phoneNumber.number': Number(contactNumber) }
            ]
        });

        return dealer;
    },

    getDealerByContactNumber: async (contactNumber) => {
        let dealer = await dealerSchema.findOne({
            'phoneNumber.number': Number(contactNumber)
        });

        return dealer;
    },

    getDealerByEmail: async (email) => {
        let dealer = await dealerSchema.findOne({ email });

        return dealer;
    },

    storeDealerOTP: async (email, otp) => {
        return await dealerSchema.findOneAndUpdate({ email }, { verificationOTP: otp }, { new: true });
    },

    verifyDealer: async (dealerId) => {
        return await dealerSchema.findByIdAndUpdate(dealerId, { emailVerified: true }, { new: true });
    },

    getDealerByDealerId: async (dealerId) => {
        let dealer = await dealerSchema.findById(dealerId);

        return dealer;
    },

    getDealerStripeAccountByDealerId: async (dealerId) => {
        try {
            let dealer = await stripeAccountSchema.findOne({dealerId});
            return dealer
        } catch (error) {
            console.log(error);
        }
    },

    //Add dealer inventory
    updateDealerFCMToken: async (dealerId, fcmToken) => {
        let update = {
            fcmToken
        }

        let editDealerToken = await dealerSchema.findByIdAndUpdate(dealerId, update, { new: true });

        return editDealerToken;
    },

    getAllDealers: async () => {
        const dealers = await dealerSchema.aggregate([
            {
                $lookup: {
                    from: 'dealerratings',
                    localField: '_id',
                    foreignField: 'dealerId',
                    as: 'ratings'
                }
            },
            {
                $lookup: {
                    from: 'inventories',
                    localField: '_id',
                    foreignField: 'dealerId',
                    as: 'inventory'
                }
            },
            {
                $unwind: '$inventory'
            },
            { 
                $project : { 
                    _id: "$_id", 
                    ratings: "$ratings", 
                    dealerShipName: "$dealerShipName", 
                    address: "$address", 
                    OMVICLicenceLink: "$OMVICLicenceLink", 
                    firstName: "$firstName", 
                    lastName: "$lastName", 
                    phoneNumber: "$phoneNumber", 
                    companyRole: "$companyRole", 
                    numberOfLocation: "$numberOfLocation", 
                    delivery: "$delivery", 
                    logo: "$logo", 
                    customerPickUp: "$customerPickUp",
                    createdAt: "$createdAt", 
                    updatedAt: "$updatedAt",
                    inventory_id: "$inventory._id", 
                    inventory_VIN: "$inventory.VIN", 
                    inventory_Stock_Number: "$inventory.Stock_Number", 
                    inventory_New_or_Used: "$inventory.New_or_Used", 
                    inventory_MSRP: "$inventory.MSRP", 
                    inventory_Year: "$inventory.Year", 
                    inventory_Make: "$inventory.Make", 
                    inventory_Model: "$inventory.Model", 
                    inventory_carFAXLink: "$inventory.carFAXLink", 
                    inventory_Body_Style: "$inventory.Body_Style", 
                    inventory_Series: "$inventory.Series", 
                    inventory_Exterior_Colour: "$inventory.Exterior_Colour", 
                    inventory_Interior_Colour: "$inventory.Interior_Colour", 
                    inventory_Trim: "$inventory.Trim", 
                    inventory_Engine_Size: "$inventory.Engine_Size", 
                    inventory_Cylinder_Count: "$inventory.Cylinder_Count", 
                    inventory_Door_Count: "$inventory.Door_Count", 
                    inventory_Drive_configuration: "$inventory.Drive_configuration", 
                    // inventory_Additional_Options: "$inventory.Additional_Options",
                    inventory_Additional_Options: {
                        $split: ["$inventory.Additional_Options", ";"]
                    }, 
                    inventory_Current_Miles: "$inventory.Current_Miles", 
                    inventory_Date_Added_to_Inventory: "$inventory.Date_Added_to_Inventory", 
                    inventory_Status: "$inventory.Status", 
                    inventory_Fuel_Type: "$inventory.Fuel_Type", 
                    inventory_Vehicle_Location: "$inventory.Vehicle_Location", 
                    inventory_Certified_Pre_owned: "$inventory.Certified_Pre_owned", 
                    inventory_Price: "$inventory.Price", 
                    inventory_Transmission_Description: "$inventory.Transmission_Description", 
                    inventory_Internet_Description: "$inventory.Internet_Description", 
                    inventory_Vehicle_Class: "$inventory.Status", 
                    inventory_Main_Photo: "$inventory.Main_Photo", 
                    inventory_Main_Photo_Last_Modified_Date: "$inventory.Main_Photo_Last_Modified_Date", 
                    inventory_Extra_Photo_Last_Modified_Date: "$inventory.Extra_Photo_Last_Modified_Date", 
                    inventory_dealerId: "$inventory.dealerId", 
                    inventory_brake_system: "$inventory.brake_system", 
                    inventory_Engine_Name: "$inventory.Engine_Name", 
                    inventory_Transmission_name: "$inventory.Transmission_name", 
                    inventory_Transmission_detail_type: "$inventory.Transmission_detail_type", 
                    inventory_Transmission_detail_gears: "$inventory.Transmission_detail_gears", 
                    inventory_carSpecification: "$inventory.carSpecification", 
                    inventory_standard_generic_equipment: "$inventory.standard_generic_equipment", 
                    inventory_standard_specifications: "$inventory.standard_specifications", 
                    inventory_image360URL: "$inventory.image360URL", 
                    inventory_createdAt: "$inventory.createdAt", 
                    inventory_updatedAt: "$inventory.updatedAt", 
                    inventory_Extra_Photos: { 
                        $split: [
                            {
                                $replaceAll: {
                                    input: {
                                        $replaceAll: {
                                            input: {
                                                $replaceAll: {
                                                    input: "$inventory.Extra_Photos",
                                                    find: " ",
                                                    replacement: ";"
                                                }
                                            },
                                            find: ",",
                                            replacement: ";"
                                        }
                                    },
                                    find: ";;",
                                    replacement: ";"
                                }
                            },
                            ";"
                        ] 
                    },
                    inventory_equipments : "$inventory.equipments",
                    inventory_recalls : "$inventory.recalls",
                    inventory_Fuel_efficienecy : "$inventory.Fuel_efficienecy",
                    inventory_Engine_Name : "$inventory.Engine_Name",
                } 
            },
            { 
                $group : { 
                    _id: { 
                        _id: "$_id",
                        dealerShipName: "$dealerShipName", 
                        address: "$address", 
                        OMVICLicenceLink: "$OMVICLicenceLink", 
                        logo: "$logo", 
                        firstName: "$firstName", 
                        lastName: "$lastName", 
                        phoneNumber: "$phoneNumber", 
                        companyRole: "$companyRole", 
                        numberOfLocation: "$numberOfLocation", 
                        delivery: "$delivery", 
                        customerPickUp: "$customerPickUp", 
                        ratings: "$ratings",
                        createdAt: "$createdAt", 
                        updatedAt: "$updatedAt", 
                        // "product_name": "$product_name", 
                        // Extra_Photos : "$Extra_Photos" 
                    }, 
                    inventory: { 
                        $push: { 
                            "url": "$assets_url",
                            VIN: "$inventory_VIN",
                            Inventory_Id: "$inventory_id", 
                            Stock_Number: "$inventory_Stock_Number", 
                            New_or_Used: "$inventory_New_or_Used", 
                            MSRP: "$inventory_MSRP", 
                            Year: "$inventory_Year", 
                            Make: "$inventory_Make", 
                            Model: "$inventory_Model", 
                            Body_Style: "$inventory_Body_Style", 
                            Series: "$inventory_Series", 
                            Exterior_Colour: "$inventory_Exterior_Colour", 
                            Interior_Colour: "$inventory_Interior_Colour", 
                            carFAXLink: "$inventory_carFAXLink", 
                            Trim: "$inventory_Trim", 
                            Engine_Size: "$inventory_Engine_Size", 
                            Cylinder_Count: "$inventory_Cylinder_Count", 
                            Door_Count: "$inventory_Door_Count", 
                            Drive_configuration: "$inventory_Drive_configuration", 
                            Additional_Options: "$inventory_Additional_Options", 
                            Current_Miles: "$inventory_Current_Miles", 
                            Date_Added_to_Inventory: "$inventory_Date_Added_to_Inventory", 
                            Status: "$inventory_Status", 
                            Fuel_Type: "$inventory_Fuel_Type", 
                            Vehicle_Location: "$inventory_Vehicle_Location", 
                            Certified_Pre_owned: "$inventory_Certified_Pre_owned", 
                            Price: "$inventory_Price", 
                            Transmission_Description: "$inventory_Transmission_Description", 
                            Internet_Description: "$inventory_Internet_Description", 
                            Vehicle_Class: "$inventory_Status", 
                            Main_Photo: "$inventory_Main_Photo", 
                            Main_Photo_Last_Modified_Date: "$inventory_Main_Photo_Last_Modified_Date", 
                            Extra_Photo_Last_Modified_Date: "$inventory_Extra_Photo_Last_Modified_Date", 
                            dealerId: "$inventory_dealerId", 
                            image360URL: "$inventory_image360URL", 
                            createdAt: "$inventory_createdAt", 
                            updatedAt: "$inventory_updatedAt", 
                            brake_system: "$inventory_brake_system", 
                            Extra_Photos: "$inventory_Extra_Photos", 
                            Engine_Name: "$inventory_Engine_Name", 
                            Transmission_name: "$inventory_Transmission_name", 
                            Transmission_detail_type: "$inventory_Transmission_detail_type", 
                            Transmission_detail_gears: "$inventory_Transmission_detail_gears", 
                            carSpecification: "$inventory_carSpecification", 
                            standard_generic_equipment: "$inventory_standard_generic_equipment", 
                            standard_specifications: "$inventory_standard_specifications", 
                            equipments: "$inventory_equipments",
                            recalls: "$inventory_recalls",
                            Fuel_efficienecy: "$inventory_Fuel_efficienecy",
                            Engine_Name: "$inventory_Engine_Name",
                        } 
                    } 
                } 
            },
            { 
                $project: { 
                    _id: "$_id._id",
                    dealerShipName: "$_id.dealerShipName", 
                    address: "$_id.address", 
                    OMVICLicenceLink: "$_id.OMVICLicenceLink", 
                    firstName: "$_id.firstName", 
                    logo: "$_id.logo", 
                    lastName: "$_id.lastName", 
                    phoneNumber: "$_id.phoneNumber", 
                    companyRole: "$_id.companyRole", 
                    numberOfLocation: "$_id.numberOfLocation", 
                    delivery: "$_id.delivery", 
                    customerPickUp: "$_id.customerPickUp", 
                    ratings: {
                        customerRating: "$_id.ratings",
                        finalRating: {
                            $avg: '$_id.ratings.finalRating'
                        }
                    }, 
                    createdAt: "$_id.createdAt", 
                    updatedAt: "$_id.updatedAt", 
                    // "product_name": "$_id.product_name", 
                    // "Extra_Photos" : "$_id.Extra_Photos", 
                    inventory: {
                        $map: {
                            input: "$inventory",
                            as: "item",
                            in: {
                                VIN: "$$item.VIN",
                                Inventory_Id: "$$item.Inventory_Id",
                                Stock_Number: "$$item.Stock_Number",
                                New_or_Used: "$$item.New_or_Used",
                                MSRP: "$$item.MSRP",
                                Year: "$$item.Year",
                                Make: "$$item.Make",
                                Model: "$$item.Model",
                                Body_Style: "$$item.Body_Style",
                                Series: "$$item.Series",
                                Exterior_Colour: "$$item.Exterior_Colour",
                                Interior_Colour: "$$item.Interior_Colour",
                                carFAXLink: "$$item.carFAXLink",
                                Trim: "$$item.Trim",
                                Engine_Size: "$$item.Engine_Size",
                                Cylinder_Count: "$$item.Cylinder_Count",
                                Door_Count: "$$item.Door_Count",
                                Drive_configuration: "$$item.Drive_configuration",
                                Additional_Options: "$$item.Additional_Options",
                                Current_Miles: "$$item.Current_Miles",
                                Date_Added_to_Inventory: "$$item.Date_Added_to_Inventory",
                                Status: "$$item.Status",
                                Fuel_Type: "$$item.Fuel_Type",
                                Vehicle_Location: "$$item.Vehicle_Location",
                                Certified_Pre_owned: "$$item.Certified_Pre_owned",
                                Price: "$$item.Price",
                                Transmission_Description: "$$item.Transmission_Description",
                                Internet_Description: "$$item.Internet_Description",
                                Vehicle_Class: "$$item.Status",
                                Main_Photo: "$$item.Main_Photo",
                                Extra_Photos: "$$item.Extra_Photos",
                                Main_Photo_Last_Modified_Date: "$$item.Main_Photo_Last_Modified_Date",
                                Extra_Photo_Last_Modified_Date: "$$item.Extra_Photo_Last_Modified_Date",
                                dealerId: "$$item.dealerId",
                                image360URL: "$$item.image360URL",
                                createdAt: "$$item.createdAt",
                                updatedAt: "$$item.updatedAt",
                                brake_system: { $ifNull: ["$$item.brake_system", ""] },
                                Engine_Name: { $ifNull: ["$$item.Engine_Name", ""] },
                                Transmission_name: { $ifNull: ["$$item.Transmission_name", ""] },
                                Transmission_detail_type: { $ifNull: ["$$item.Transmission_detail_type", ""] },
                                Transmission_detail_gears: { $ifNull: ["$$item.Transmission_detail_gears", 0] },
                                carSpecification: { $ifNull: ["$$item.carSpecification", ""] },
                                standard_generic_equipment: { $ifNull: ["$$item.standard_generic_equipment", []] },
                                standard_specifications: { $ifNull: ["$$item.standard_specifications", []] },
                                recalls : { $ifNull: ["$$item.recalls", []] },
                                equipments : { $ifNull: ["$$item.equipments", []] },
                                Fuel_efficienecy : { $ifNull: ["$$item.Fuel_efficienecy", {
                                    "city": "",
                                    "highway": "",
                                }] },
                                Engine_Name : { $ifNull: ["$$item.Engine_Name", ""] }
                            }
                        }
                    } 
                } 
            }
        ]);

        return dealers;
    },

    editDealerDetails: async (params) => {
        let update = {
            name: params.name,
            logo: params.logo,
            location: {
                lat: params.lat,
                long: params.long
            }
        };

        const updateDealer = await dealerSchema.findByIdAndUpdate(params.dealerId, update, { new: true });

        return updateDealer;
    },

    deleteDealer: async (dealerId) => {
        await dealerSchema.findByIdAndDelete(dealerId);

        return true;
    },

    addDealerRating: async (params, user) => {
        let addRating = await new dealerRating({
            dealerId: params.dealerId,
            customerId: user._id,
            customerName: user.firstName + ' ' + user.lastName,
            finalRating: params.finalRating,
            communication: params.communication,
            service: params.service,
            vehicle: params.vehicle,
        });

        if(addRating !== undefined) {
            return addRating.save();
        } else {
            return undefined;
        }
    },

    getDealerRating: async (dealerId) => {
        let ratings = await dealerRating.find({ dealerId })
                                        .populate({
                                            path: 'dealerId'
                                        });

        return ratings;
    },

    getAllDealerRating: async (dealerId) => {
        let ratings = await dealerRating.find()
                                        .populate({
                                            path: 'dealerId'
                                        });

        return ratings;
    },

    createDealerStripeAccount: async (params, onBoardingLinks, dealerId) => {
        let stripeAccountDetails = await new stripeAccountSchema({
            dealerId,
            stripeAccountId: params.id,
            object: params.object,
            country: params.country,
            default_currency: params.default_currency,
            type: params.type,
            loginLink: params.login_links.url,
            onBoardingLink: onBoardingLinks.url,
        });

        if (stripeAccountDetails != null) {
            return stripeAccountDetails.save();
        } else {
            return false;
        }
    },

    getNearByDealer: async (dealer) => {
        let dealerInformation = await dealerSchema.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(dealer._id)
                }
            },
            {
                $lookup: {
                    from: 'inventories',
                    localField: '_id',
                    foreignField: 'dealerId',
                    as: 'inventory'
                }
            },
            {
                $lookup: {
                    from: 'dealerratings',
                    localField: '_id',
                    foreignField: 'dealerId',
                    as: 'ratings'
                }
            },
            {
                $unwind: '$inventory'
            },
            { 
                $project : { 
                    _id: "$_id", 
                    dealerShipName: "$dealerShipName", 
                    address: "$address", 
                    OMVICLicenceLink: "$OMVICLicenceLink", 
                    firstName: "$firstName", 
                    lastName: "$lastName", 
                    phoneNumber: "$phoneNumber", 
                    companyRole: "$companyRole", 
                    numberOfLocation: "$numberOfLocation", 
                    delivery: "$delivery", 
                    customerPickUp: "$customerPickUp", 
                    createdAt: "$createdAt", 
                    updatedAt: "$updatedAt",
                    inventory_id: "$inventory._id", 
                    inventory_VIN: "$inventory.VIN", 
                    inventory_Stock_Number: "$inventory.Stock_Number", 
                    inventory_New_or_Used: "$inventory.New_or_Used", 
                    inventory_MSRP: "$inventory.MSRP", 
                    inventory_Year: "$inventory.Year", 
                    inventory_Make: "$inventory.Make", 
                    inventory_Model: "$inventory.Model", 
                    inventory_Body_Style: "$inventory.Body_Style", 
                    inventory_Series: "$inventory.Series", 
                    inventory_Exterior_Colour: "$inventory.Exterior_Colour", 
                    inventory_Interior_Colour: "$inventory.Interior_Colour", 
                    inventory_Trim: "$inventory.Trim", 
                    inventory_Engine_Size: "$inventory.Engine_Size", 
                    inventory_Cylinder_Count: "$inventory.Cylinder_Count", 
                    inventory_Door_Count: "$inventory.Door_Count", 
                    inventory_Drive_configuration: "$inventory.Drive_configuration", 
                    // inventory_Additional_Options: "$inventory.Additional_Options", 
                    inventory_Additional_Options: {
                        $split: ["$inventory.Additional_Options", ";"]
                    }, 
                    inventory_Current_Miles: "$inventory.Current_Miles", 
                    inventory_Date_Added_to_Inventory: "$inventory.Date_Added_to_Inventory", 
                    inventory_Status: "$inventory.Status", 
                    inventory_Fuel_Type: "$inventory.Fuel_Type", 
                    inventory_Vehicle_Location: "$inventory.Vehicle_Location", 
                    inventory_Certified_Pre_owned: "$inventory.Certified_Pre_owned", 
                    inventory_Price: "$inventory.Price", 
                    inventory_Transmission_Description: "$inventory.Transmission_Description", 
                    inventory_Internet_Description: "$inventory.Internet_Description", 
                    inventory_Vehicle_Class: "$inventory.Status", 
                    inventory_Main_Photo: "$inventory.Main_Photo", 
                    inventory_Main_Photo_Last_Modified_Date: "$inventory.Main_Photo_Last_Modified_Date", 
                    inventory_Extra_Photo_Last_Modified_Date: "$inventory.Extra_Photo_Last_Modified_Date", 
                    inventory_dealerId: "$inventory.dealerId", 
                    inventory_createdAt: "$inventory.createdAt", 
                    inventory_updatedAt: "$inventory.updatedAt", 
                    Extra_Photos : { 
                        $split: ["$inventory.Extra_Photos", ";"] 
                    },
                    equipments: "$inventory.equipments",
                    recalls: "$inventory.recalls"
                } 
            },
            { 
                $group : { 
                    _id: { 
                        _id: "$_id",
                        dealerShipName: "$dealerShipName", 
                        address: "$address", 
                        OMVICLicenceLink: "$OMVICLicenceLink", 
                        firstName: "$firstName", 
                        lastName: "$lastName", 
                        phoneNumber: "$phoneNumber", 
                        companyRole: "$companyRole", 
                        numberOfLocation: "$numberOfLocation", 
                        delivery: "$delivery", 
                        customerPickUp: "$customerPickUp", 
                        createdAt: "$createdAt", 
                        updatedAt: "$updatedAt", 
                        // "product_name": "$product_name", 
                        // "Extra_Photos" : "$Extra_Photos" 
                    }, 
                    inventory: { 
                        $push: { 
                            "url": "$assets_url",
                            VIN: "$inventory_VIN",
                            Inventory_Id: "$inventory_id", 
                            Stock_Number: "$inventory_Stock_Number", 
                            New_or_Used: "$inventory_New_or_Used", 
                            MSRP: "$inventory_MSRP", 
                            Year: "$inventory_Year", 
                            Make: "$inventory_Make", 
                            Model: "$inventory_Model", 
                            Body_Style: "$inventory_Body_Style", 
                            Series: "$inventory_Series", 
                            Exterior_Colour: "$inventory_Exterior_Colour", 
                            Interior_Colour: "$inventory_Interior_Colour", 
                            Trim: "$inventory_Trim", 
                            Engine_Size: "$inventory_Engine_Size", 
                            Cylinder_Count: "$inventory_Cylinder_Count", 
                            Door_Count: "$inventory_Door_Count", 
                            Drive_configuration: "$inventory_Drive_configuration", 
                            Additional_Options: "$inventory_Additional_Options", 
                            Current_Miles: "$inventory_Current_Miles", 
                            Date_Added_to_Inventory: "$inventory_Date_Added_to_Inventory", 
                            Status: "$inventory_Status", 
                            Fuel_Type: "$inventory_Fuel_Type", 
                            Vehicle_Location: "$inventory_Vehicle_Location", 
                            Certified_Pre_owned: "$inventory_Certified_Pre_owned", 
                            Price: "$inventory_Price", 
                            Transmission_Description: "$inventory_Transmission_Description", 
                            Internet_Description: "$inventory_Internet_Description", 
                            Vehicle_Class: "$inventory_Status", 
                            Main_Photo: "$inventory_Main_Photo", 
                            Main_Photo_Last_Modified_Date: "$inventory_Main_Photo_Last_Modified_Date", 
                            Extra_Photo_Last_Modified_Date: "$inventory_Extra_Photo_Last_Modified_Date", 
                            dealerId: "$inventory_dealerId", 
                            createdAt: "$inventory_createdAt", 
                            updatedAt: "$inventory_updatedAt", 
                            Extra_Photos: "$Extra_Photos",
                            recalls: "$inventory_recalls",
                            equipments: "$inventory_equipments"
                        } 
                    } 
                } 
            },
            { 
                $project: { 
                    _id: "$_id._id",
                    dealerShipName: "$_id.dealerShipName", 
                    address: "$_id.address", 
                    OMVICLicenceLink: "$_id.OMVICLicenceLink", 
                    firstName: "$_id.firstName", 
                    lastName: "$_id.lastName", 
                    phoneNumber: "$_id.phoneNumber", 
                    companyRole: "$_id.companyRole", 
                    numberOfLocation: "$_id.numberOfLocation", 
                    delivery: "$_id.delivery", 
                    customerPickUp: "$_id.customerPickUp", 
                    createdAt: "$_id.createdAt", 
                    updatedAt: "$_id.updatedAt", 
                    // "product_name": "$_id.product_name", 
                    // "Extra_Photos" : "$_id.Extra_Photos", 
                    inventory: "$inventory" 
                } 
            }
        ]);

        return dealerInformation;
    },

    getNearByDealerData: async (dealer) => {
        let dealerInformation = await dealerSchema.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(dealer._id)
                }
            },
            {
                $lookup: {
                    from: 'inventories',
                    localField: '_id',
                    foreignField: 'dealerId',
                    as: 'inventory'
                }
            },
            {
                $lookup: {
                    from: 'dealerratings',
                    localField: '_id',
                    foreignField: 'dealerId',
                    as: 'ratings'
                }
            }
        ]);

        return dealerInformation;
    },

    getDealerDashboardNotification: async (dealerId) => {

        let getNotifications = await notificationStorageSchema.find({ 
                                                                    receiverId: String(dealerId),
                                                                    title: { $ne: '' }, 
                                                                    body: { $ne: '' } 
                                                                })
                                                                .sort({ 
                                                                    createdAt: -1 
                                                                });

        return getNotifications;
    },

    getDealerStripeOnBoardingLink: async (dealerId) => {
        let stripeDetails = await stripeAccountSchema.findOne({ dealerId });

        return stripeDetails;
    },

    deleteDealerStripeInformation: async (dealerId) => {
        await stripeAccountSchema.findOneAndDelete({ dealerId });

        return true;
    },

    deleteUnrelatedInventories: async () => {
        const dealerIdsToKeep = [ '66ba9195c715bfa0b88887f2', '66bb9502020b0780a8dff0de', '66c22d3fb25f629f8f050972', '66db783ba3f5dc72a6ed55c2', '66f6ff47664a073b6f0ac33b' ];

        await inventorySchema.deleteMany({ dealerId: { $nin: dealerIdsToKeep } });

    },

    deleteImagesFromInventory: async (inventoryId, imageUrlToRemove) => {
        const inventory = await inventorySchema.findById(inventoryId);

        // Check if inventory exists
        if (!inventory || !inventory.Extra_Photos) {
           return false;
        }

        const photosArray = inventory.Extra_Photos.split(';');

        const updatedPhotosArray = photosArray.filter(photoUrl => photoUrl !== imageUrlToRemove);

        const updatedPhotosString = updatedPhotosArray.join(';');

        await inventorySchema.findByIdAndUpdate(inventoryId, {
            Extra_Photos: updatedPhotosString
        });

        return true;
    },

    editInventoryFields: async (params, currentValue) => {
        let update = {
            VIN: params?.VIN !== undefined && params?.VIN !== '' && params?.VIN !== null ? params?.VIN : currentValue?.VIN, 
            Stock_Number: params?.Stock_Number !== undefined && params?.Stock_Number !== '' && params?.Stock_Number !== null ? params?.Stock_Number : currentValue?.Stock_Number, 
            New_or_Used: params?.New_or_Used !== undefined && params?.New_or_Used !== '' && params?.New_or_Used !== null ? params?.New_or_Used : currentValue?.New_or_Used, 
            MSRP: params?.MSRP !== undefined && params?.MSRP !== '' && params?.MSRP !== null ? params?.MSRP : currentValue?.MSRP, 
            Year: params?.Year !== undefined && params?.Year !== '' && params?.Year !== null ? params?.Year : currentValue?.Year, 
            Make: params?.Make !== undefined && params?.Make !== '' && params?.Make !== null ? params?.Make : currentValue?.Make, 
            Model: params?.Model !== undefined && params?.Model !== '' && params?.Model !== null ? params?.Model : currentValue?.Model, 
            carFAXLink: params?.carFAXLink !== undefined && params?.carFAXLink !== '' && params?.carFAXLink !== null ? params?.carFAXLink : currentValue?.carFAXLink, 
            Body_Style: params?.Body_Style !== undefined && params?.Body_Style !== '' && params?.Body_Style !== null ? params?.Body_Style : currentValue?.Body_Style, 
            Series: params?.Series !== undefined && params?.Series !== '' && params?.Series !== null ? params?.Series : currentValue?.Series, 
            Exterior_Colour: params?.Exterior_Colour !== undefined && params?.Exterior_Colour !== '' && params?.Exterior_Colour !== null ? params?.Exterior_Colour : currentValue?.Exterior_Colour, 
            Interior_Colour: params?.Interior_Colour !== undefined && params?.Interior_Colour !== '' && params?.Interior_Colour !== null ? params?.Interior_Colour : currentValue?.Interior_Colour, 
            Trim:params?.Trim !== undefined && params?.Trim !== '' && params?.Trim !== null ? params?.Trim : currentValue?.Trim, 
            Engine_Size: params?.Engine_Size !== undefined && params?.Engine_Size !== '' && params?.Engine_Size !== null ? params?.Engine_Size : currentValue?.Engine_Size, 
            Cylinder_Count: params?.Cylinder_Count !== undefined && params?.Cylinder_Count !== '' && params?.Cylinder_Count !== null ? params?.Cylinder_Count : currentValue?.Cylinder_Count, 
            Door_Count: params?.Door_Count !== undefined && params?.Door_Count !== '' && params?.Door_Count !== null ? params?.Door_Count : currentValue?.Door_Count,
            Current_Miles: params?.Current_Miles !== undefined && params?.Current_Miles !== '' && params?.Current_Miles !== null ? params?.Current_Miles : currentValue?.Current_Miles, 
            Date_Added_to_Inventory: params?.Date_Added_to_Inventory !== undefined && params?.Date_Added_to_Inventory !== '' && params?.Date_Added_to_Inventory !== null ? params?.Date_Added_to_Inventory : currentValue?.Date_Added_to_Inventory, 
            Status: params?.Status !== undefined && params?.Status !== '' && params?.Status !== null ? params?.Status : currentValue?.Status, 
            Fuel_Type: params?.Fuel_Type !== undefined && params?.Fuel_Type !== '' && params?.Fuel_Type !== null ? params?.Fuel_Type : currentValue?.Fuel_Type, 
            Vehicle_Location: params?.Vehicle_Location !== undefined && params?.Vehicle_Location !== '' && params?.Vehicle_Location !== null ? params?.Vehicle_Location : currentValue?.Vehicle_Location, 
            Certified_Pre_owned: params?.Certified_Pre_owned !== undefined && params?.Certified_Pre_owned !== '' && params?.Certified_Pre_owned !== null ? params?.Certified_Pre_owned : currentValue?.Certified_Pre_owned, 
            Price: params?.Price !== undefined && params?.Price !== '' && params?.Price !== null ? params?.Price : currentValue?.Price, 
            Transmission_Description: params?.Transmission_Description !== undefined && params?.Transmission_Description !== '' && params?.Transmission_Description !== null ? params?.Transmission_Description : currentValue?.Transmission_Description, 
            Internet_Description: params?.Internet_Description !== undefined && params?.Internet_Description !== '' && params?.Internet_Description !== null ? params?.Internet_Description : currentValue?.Internet_Description, 
            Vehicle_Class: params?.Vehicle_Class !== undefined && params?.Vehicle_Class !== '' && params?.Vehicle_Class !== null ? params?.Vehicle_Class : currentValue?.Vehicle_Class,
            image360URL: params?.image360URL !== undefined && params?.image360URL !== '' && params?.image360URL !== null ? params?.image360URL : currentValue?.image360URL
        }

        const editInventoryCarDetails = await inventorySchema.findByIdAndUpdate(params.inventoryId, update, { new: true });

        if (editInventoryCarDetails) {
            return editInventoryCarDetails;
        } else {
            return false;
        }
    },

    getEntireInventory: async () => {
        let inventoryList = await inventorySchema.find()
                                                 .populate({
                                                    path: 'dealerId',
                                                    select: 'dealerShipName firstName lastName phoneNumber'
                                                 });

        return inventoryList;
    },

    editNotificationStatusAsRead: async (notificationId) => {
        const editNoti = await notificationStorageSchema.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });

        return editNoti;
    },

    editBunchNotificationStatusAsRead: async (notificationIdsList) => {
        const filter = { _id: { $in: notificationIdsList.map(id => new ObjectId(id)) } };
        const update = { $set: { isRead: true } };
        const editNoti = await notificationStorageSchema.updateMany(filter, update);

        return editNoti;
    },

    editDealerAllNotificationAsRead: async (dealerId) => {
        const editNotification = await notificationStorageSchema.updateMany({ receiverId: String(dealerId) }, { isRead: true }, { new: true });

        return editNotification;
    },

    getVINsFromDB: async (dealerId) => {
        const result = await inventorySchema.find({ dealerId })
        return result.map(row => row.VIN);
    },
    
    deleteVINsFromDB: async (vinsToDelete, dealerId) => {
        if (vinsToDelete.length === 0) return;

        await inventorySchema.deleteMany({ VIN: { $in: vinsToDelete }, dealerId });
    }
}