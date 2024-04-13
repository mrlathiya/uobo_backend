const mongoose = require('mongoose');

const vehicleTypeSchema = mongoose.Schema({
    name: {
        type: String
    },
    icon: {
        type: String
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('vehicleTypes', vehicleTypeSchema);