const mongoose = require('mongoose');

const mortgageTypeSchema = mongoose.Schema({
    name: {
        type: String
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('mortgageTypes', mortgageTypeSchema)