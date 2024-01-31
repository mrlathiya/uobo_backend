const dealerSchema = require('../models/dealer');
const dealerRating = require('../models/dealerRating');

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
            console.log('inn')
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
            phoneNumber: params.phoneNumber,
            companyRole: params.companyRole,
            numberOfLocation: params.numberOfLocation,
            delivery: {
                uoboDelivery: params.uoboDelivery,
                ownDeliveryStaff: params.ownDeliveryStaff,
            },
            customerPickUp: params.customerPickUp,
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

    loginDealer: async (params) => {
        let dealer = await dealerSchema.findOne({ phoneNumber: params.phoneNumber });

        return dealer;
    },

    getDealerByDealerId: async (dealerId) => {
        let dealer = await dealerSchema.findById(dealerId);

        return dealer;
    },

    getAllDealers: async () => {
        const dealers = await dealerSchema.find();

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

    addDealerRating: async (params) => {
        let addRating = await new dealerRating({
            dealerId: params.dealerId,
            finalRating: params.finalRating,
            communication: params.communication,
            service: params.service,
            vehicle: params.vehicle,
        });

        console.log(addRating);

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

    getNearByDealer: async () => {
        let dealerInformation = await dealerSchema.aggregate([
            {
                $lookup: {
                    from: 'cars',
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
                    // Extra_Photos :"$Extra_Photos", 
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
                    inventory_Additional_Options: "$inventory.Additional_Options", 
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
                    } 
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
                            Extra_Photos: "$Extra_Photos" 
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
    }
}