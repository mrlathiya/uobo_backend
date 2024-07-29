const mongoose = require('mongoose');

const carSchema = mongoose.Schema({
    VIN: {
        type: String
    },
    Stock_Number: {
        type: String
    },
    New_or_Used: {
        type: String
    },
    MSRP: {
        type: String
    },
    Year: {
        type: String
    },
    Make: {
        type: String,
        index: true
    },
    Model: {
        type: String,
        index: true
    },
    Body_Style: {
        type: String,
        index: true
    },
    Series: {
        type: String
    },
    Exterior_Colour: {
        type: String,
        index: true
    },
    Interior_Colour: {
        type: String
    },
    Trim: {
        type: String
    },
    Engine_Size: {
        type: String
    },
    Cylinder_Count: {
        type: String
    },
    Door_Count: {
        type: String
    },
    Drive_configuration: {
        type: String
    },
    Additional_Options: {
        type: String
    },
    Current_Miles: {
        type: String
    },
    Date_Added_to_Inventory: {
        type: String
    },
    Status: {
        type: String
    },
    Fuel_Type: {
        type: String
    },
    Vehicle_Location: {
        type: String
    },
    Certified_Pre_owned: {
        type: String
    },
    Price: {
        type: String
    },
    Transmission_Description: {
        type: String
    },
    Internet_Description: {
        type: String
    },
    Vehicle_Class: {
        type: String
    },
    Main_Photo: {
        type: String
    },
    Main_Photo_Last_Modified_Date: {
        type: String
    },
    Extra_Photos: {
        type: String
    },
    Extra_Photo_Last_Modified_Date: {
        type: String
    },
    location: {
        lat: {
            type: Number
        },
        long: {
            type: Number
        },
    },
    dealerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'dealers', 
    },
    feature: {
        interior: {
            icon: {
                type: String
            },
            featureName: {
                type: String
            }
        },
        vehicle: {
            icon: {
                type: String
            },
            featureName: {
                type: String
            }
        },
        technical: {
            icon: {
                type: String
            },
            featureName: {
                type: String
            }
        },
    },
    carFAXLink: {
        type: String,
        default: ''
    },
    image360URL: {
        type: String
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('inventory', carSchema);