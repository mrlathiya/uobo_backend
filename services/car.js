const carSchema = require('../models/car');
const vehicleTypeSchema = require('../models/vehicleType');
const additionalCarServices = require('../models/additionalCarServices');

module.exports = {
    addNewCar: async (params, dealerId) => {
        let addCar = await new carSchema({
            dealerId,
            VIN: params.VIN,
            Stock_Number: params.Stock_Number,
            New_or_Used: params.New_or_Used,
            MSRP: params.MSRP,
            Year: params.Year,
            Make: params.Make,
            Model: params.Model,
            Body_Style: params.Body_Style,
            Series: params.Series,
            Exterior_Colour: params.Exterior_Colour,
            Interior_Colour: params.Interior_Colour,
            Trim: params.Trim,
            Engine_Size: params.Engine_Size,
            Cylinder_Count: params.Cylinder_Count,
            Door_Count: params.Door_Count,
            Drive_configuration: params.Drive_configuration,
            Additional_Options: params.Additional_Options,
            Current_Miles: params.Current_Miles,
            Date_Added_to_Inventory: params.Date_Added_to_Inventory,
            Status: params.Status,
            Fuel_Type: params.Fuel_Type,
            Vehicle_Location: params.Vehicle_Location,
            Certified_Pre_owned: params.Certified_Pre_owned,
            Price: params.Price,
            Transmission_Description: params.Transmission_Description,
            Internet_Description: params.Internet_Description,
            Vehicle_Class: params.Vehicle_Class,
            Main_Photo: params.Main_Photo,
            Main_Photo_Last_Modified_Date: params.Main_Photo_Last_Modified_Date,
            Extra_Photos: params.Extra_Photos,
            Extra_Photo_Last_Modified_Date: params.Extra_Photo_Last_Modified_Date,
            location: params.location,
            mileage: params.mileage,
            pricing: params.pricing,
            decription: params.decription,
            feature: params.feature,
            brake_system: params.brake_system,
            Engine_Name: params.Engine_Name,
            carSpecification: params.carSpecification,
            standard_generic_equipment: params.standard_generic_equipment,
            standard_specifications: params.standard_specifications,
            Transmission: {
                name: params.Transmission_name,
                detail_type: params.Transmission_detail_type,
                detail_gears: params.Transmission_detail_gears,
            },
            Fuel_efficienecy: {
                city: params.Fuel_efficienecy_city,
                highway: params.Fuel_efficienecy_highway,
                combined: params.Fuel_efficienecy_combined,
            },
            carFAXLink: params.carfaxlink
        });

        if (addCar) {
            return addCar.save();
        } else {
            return false;
        }
    },

    getCarByVIN: async (VIN) => {
        const car = await carSchema.find({ VIN });

        return car;
    },

    getCarByVINId: async (VIN) => {
        const car = await carSchema.findOne({ VIN });

        return car;
    },

    getCarByDealerId: async (dealerId) => {
        const car = await carSchema.find({ dealerId });

        return car;
    },

    getAllCars: async () => {
        let cars = await carSchema.find();

        return cars;
    },

    getCarById: async (carId) => {
        let car = await carSchema.findById(carId);

        return car;
    },

    editCarDetails: async (params, dealerId, carId, prev) => {
        let carIdIs = params._id !== undefined && params._id !== null && params._id !== '' ? params._id : carId;

        let update = {
            dealerId: dealerId ? dealerId : undefined,
            VIN: params.VIN,
            Stock_Number: params.Stock_Number !== undefined ? params.Stock_Number : prev.Stock_Number,
            New_or_Used: params.New_or_Used !== undefined ? params.New_or_Used : prev.New_or_Used,
            MSRP: params.MSRP !== undefined ? params.MSRP : prev.MSRP,
            Year: params.Year !== undefined ? params.Year : prev.Year,
            Make: params.Make !== undefined ? params.Make : prev.Make,
            Model: params.Model !== undefined ? params.Model : prev.Model,
            Body_Style: params.Body_Style !== undefined ? params.Body_Style : prev.Body_Style,
            Series: params.Series !== undefined ? params.Series : prev.Series,
            Exterior_Colour: params.Exterior_Colour !== undefined ? params.Exterior_Colour : prev.Exterior_Colour,
            Interior_Colour: params.Interior_Colour !== undefined ? params.Interior_Colour : prev.Interior_Colour,
            Trim: params.Trim !== undefined ? params.Trim : prev.Trim,
            Engine_Size: params.Engine_Size !== undefined ? params.Engine_Size : prev.Engine_Size,
            Cylinder_Count: params.Cylinder_Count !== undefined ? params.Cylinder_Count : prev.Cylinder_Count,
            Door_Count: params.Door_Count !== undefined ? params.Door_Count : prev.Door_Count,
            Drive_configuration: params.Drive_configuration !== undefined ? params.Drive_configuration : prev.Drive_configuration,
            Additional_Options: params.Additional_Options !== undefined ? params.Additional_Options : prev.Additional_Options,
            Current_Miles: params.Current_Miles !== undefined ? params.Current_Miles : prev.Current_Miles,
            Date_Added_to_Inventory: params.Date_Added_to_Inventory !== undefined ? params.Date_Added_to_Inventory : prev.Date_Added_to_Inventory,
            Status: params.Status !== undefined ? params.Status : prev.Status,
            Fuel_Type: params.Fuel_Type !== undefined ? params.Fuel_Type : prev.Fuel_Type,
            Vehicle_Location: params.Vehicle_Location !== undefined ? params.Vehicle_Location : prev.Vehicle_Location,
            Certified_Pre_owned: params.Certified_Pre_owned !== undefined ? params.Certified_Pre_owned : prev.Certified_Pre_owned,
            Price: params.Price !== undefined ? params.Price : prev.Price,
            Transmission_Description: params.Transmission_Description !== undefined ? params.Transmission_Description : prev.Transmission_Description,
            Internet_Description: params.Internet_Description !== undefined ? params.Internet_Description : prev.Internet_Description,
            Vehicle_Class: params.Vehicle_Class !== undefined ? params.Vehicle_Class : prev.Vehicle_Class,
            Main_Photo: params.Main_Photo !== undefined ? params.Main_Photo : prev.Main_Photo,
            Main_Photo_Last_Modified_Date: params.Main_Photo_Last_Modified_Date !== undefined ? params.Main_Photo_Last_Modified_Date : prev.Main_Photo_Last_Modified_Date,
            Extra_Photos: params.Extra_Photos !== undefined ? params.Extra_Photos : prev.Extra_Photos,
            Extra_Photo_Last_Modified_Date: params.Extra_Photo_Last_Modified_Date,
            location: params.location !== undefined ? params.location : prev.location,
            mileage: params.mileage !== undefined ? params.mileage : prev.mileage,
            pricing: params.pricing !== undefined ? params.pricing : prev.pricing,
            decription: params.decription !== undefined ? params.decription : prev.description,
            image360URL: params.image360URL !== undefined ? params.image360URL : prev.image360URL,
            feature: params.feature !== undefined ? params.feature : prev.feature,
            brake_system: params.brake_system !== undefined ? params.brake_system : prev.brake_system,
            Engine_Name: params.Engine_Name !== undefined ? params.Engine_Name : prev.Engine_Name,
            recalls: params.recalls !== undefined ? params.recalls : prev.recalls,
            equipments: params.equipments !== undefined ? params.equipments : prev.equipments,
            Transmission: {
                name: params.Transmission_name !== undefined ? params.Transmission_name : prev.Transmission_name,
                detail_type: params.Transmission_detail_type ? params.Transmission_detail_type : prev.Transmission_detail_type,
                detail_gears: params.Transmission_detail_gears ? params.Transmission_detail_gears : prev.Transmission_detail_gears,
            },
            Fuel_efficienecy: {
                city: params.Fuel_efficienecy_city !== undefined ? params.Fuel_efficienecy_city : prev.Fuel_efficienecy_city,
                highway: params.Fuel_efficienecy_highway !== undefined ? params.Fuel_efficienecy_highway : prev.Fuel_efficienecy_highway,
                combined: params.Fuel_efficienecy_combined !== undefined ? params.Fuel_efficienecy_combined : prev.Fuel_efficienecy_combined,
            }
        }

        let updateCar = await carSchema.findByIdAndUpdate(carIdIs, update, { new: true });
        
        return updateCar; 
    },

    deleteAllCars: async () => {
        return carSchema.deleteMany({});
    },

    deleteCarById: async (carId) => {
        return carSchema.deleteOne({ _id: carId })
    },

    deleteCarByDealerId: async (dealerId) => {
        return carSchema.deleteMany({ dealerId })
    },

    addVehicleType: async (params) => {
        let addType = await new vehicleTypeSchema({
            name: params.name,
            icon: params.icon,
        });

        if (addType) {
            return addType.save();
        }
    },

    getVehicleType: async () => {
        return vehicleTypeSchema.find();
    },

    searchOperation: async (sentence, userId, userType) => {
        // Split the sentence into words
        let keywords = sentence.split(' ').map(word => word.trim()).filter(word => word !== '');
    
        let orConditions = keywords.map((word) => {
            const regex = { $regex: word, $options: 'i' };
            return {
                $or: [
                    { Make: regex },
                    { Model: regex },
                    { Body_Style: regex },
                    { Exterior_Colour: regex }
                ]
            };
        });
    
        // Combine the conditions
        let query = { $and: orConditions };
    
        if (userType === 'dealer') {
            query.dealerId = userId;
        }
    
        // Execute the search query
        let cars = await carSchema.find(query);
    
        return cars;
    },

    addNewAdditionalCarServices: async (params) => {
        let addService = await new additionalCarServices({
            name: params.name,
            description: params.description,
            icon: params.icon,
            price: params.price ? Number(params.price) : undefined,
            dealerId: params.dealerId ? params.dealerId : undefined,
            pricingType: params.pricingType ? params.pricingType : undefined,
        });

        if (addService) {
            return addService.save();
        } else {
            return undefined;
        }
    },

    getAdditionalCarServices: async (dealerId) => {
        let services = [];

        if (dealerId !== undefined && dealerId !== null && dealerId !== '') {
            services = await additionalCarServices.findOne({ dealerId });
        } else {
            services = await additionalCarServices.find();
        }

        return services;
    },

    edit360ImageURL: async (url, extraPhotos, VINNumber) => {
        const update = {
            image360URL: url,
            Extra_Photos: extraPhotos
        }
        let updateCar = await carSchema.findOneAndUpdate({ VIN: VINNumber }, update, { new: true });

        return updateCar;
    },

    filteredInventory: async (params) => {

        const matchConditions = {
            ...(params.Make && { Make: params.Make }),
            ...(params.Model && { Model: params.Model }),
            ...(params.transmission && { Transmission_Description: params.transmission }),
            ...(params.fuelType && { Fuel_Type: params.fuelType }),
            ...(params.color && {
                Exterior_Colour: Array.isArray(params.color) ? { $in: params.color } : params.color
            })
        };
        
        const priceConditions = (
            params.priceMin !== undefined &&
            params.priceMax !== undefined &&
            params.priceMin !== null &&
            params.priceMax !== null
        ) ? {
            PriceNum: {
                $gte: Number(params.priceMin),
                $lte: Number(params.priceMax)
            }
        } : {};
        
        const yearConditions = (
            params.yearMin !== undefined &&
            params.yearMax !== undefined &&
            params.yearMin !== null &&
            params.yearMax !== null
        ) ? {
            Year: {
                $gte: Number(params.yearMin),
                $lte: Number(params.yearMax)
            }
        } : {};
        
        const kmsConditions = (
            params.kmsMin !== undefined &&
            params.kmsMax !== undefined &&
            params.kmsMin !== null &&
            params.kmsMax !== null
        ) ? {
            Current_Miles: {
                $gte: Number(params.kmsMin),
                $lte: Number(params.kmsMax)
            }
        } : {};
        
        const filterCar = await carSchema.aggregate([
            {
                $match: {
                    ...matchConditions,
                }
            },
            {
                $addFields: {
                    PriceNum: {
                        $convert: {
                            input: "$Price",
                            to: "double",
                            onError: null,
                            onNull: null
                        }
                    }
                }
            },
            {
                $match: {
                    ...priceConditions,
                    ...yearConditions,
                    ...kmsConditions,
                }
            },
            {
                $lookup: {
                    from: 'dealers',
                    localField: 'dealerId',
                    foreignField: '_id',
                    as: 'dealerId'
                }
            },
            {
                $unwind: "$dealerId"
            }
        ]);
        
        return filterCar;
    },

    testcheck: async () => {
        await carSchema.updateMany({ carFAXLink: 'https://vhr.carfax.ca/?id=8IksBDs/7pZGv6Y67AWUY9lcao3Z06+8' });
    }
};