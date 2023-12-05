const carSchema = require('../models/car');

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
            feature: params.feature
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

    editCarDetails: async (params) => {
        let update = {
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
            feature: params.feature
        }

        let updateCar = await carSchema.findByIdAndUpdate(params.carId, update, { new: true });
        
        return updateCar;
    },

    deleteAllCars: async () => {
        return carSchema.deleteMany({});
    }
};