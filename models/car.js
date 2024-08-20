const mongoose = require('mongoose');

const carSchema = mongoose.Schema({
    VIN: {
        type: String,
        default: ''
    },
    Stock_Number: {
        type: String,
        default: ''
    },
    New_or_Used: {
        type: String,
        default: ''
    },
    MSRP: {
        type: String,
        default: ''
    },
    Year: {
        type: String,
        default: ''
    },
    Make: {
        type: String,
        default: '',
        index: true
    },
    Model: {
        type: String,
        default: '',
        index: true
    },
    Body_Style: {
        type: String,
        default: '',
        index: true
    },
    Series: {
        type: String,
        default: ''
    },
    Exterior_Colour: {
        type: String,
        default: '',
        index: true
    },
    Interior_Colour: {
        type: String,
        default: ''
    },
    Trim: {
        type: String,
        default: ''
    },
    Engine_Size: {
        type: String,
        default: ''
    },
    Cylinder_Count: {
        type: String,
        default: ''
    },
    Door_Count: {
        type: String,
        default: ''
    },
    Drive_configuration: {
        type: String,
        default: ''
    },
    Additional_Options: {
        type: String,
        default: ''
    },
    Current_Miles: {
        type: String,
        default: ''
    },
    Date_Added_to_Inventory: {
        type: String,
        default: ''
    },
    Status: {
        type: String,
        default: ''
    },
    Fuel_Type: {
        type: String,
        default: ''
    },
    Vehicle_Location: {
        type: String,
        default: ''
    },
    Certified_Pre_owned: {
        type: String,
        default: ''
    },
    Price: {
        type: String,
        default: ''
    },
    Transmission_Description: {
        type: String,
        default: ''
    },
    Internet_Description: {
        type: String,
        default: ''
    },
    Vehicle_Class: {
        type: String,
        default: ''
    },
    Main_Photo: {
        type: String,
        default: ''
    },
    Main_Photo_Last_Modified_Date: {
        type: String,
        default: ''
    },
    Extra_Photos: {
        type: String,
        default: ''
    },
    Extra_Photo_Last_Modified_Date: {
        type: String,
        default: ''
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
                type: String,
                default: ''
            },
            featureName: {
                type: String,
                default: ''
            }
        },
        vehicle: {
            icon: {
                type: String,
                default: ''
            },
            featureName: {
                type: String,
                default: ''
            }
        },
        technical: {
            icon: {
                type: String,
                default: ''
            },
            featureName: {
                type: String,
                default: ''
            }
        },
    },
    carFAXLink: {
        type: String,
        default: ''
    },
    image360URL: {
        type: String,
        default: ''
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('inventory', carSchema);