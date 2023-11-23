const mongoose = require('mongoose');

const dealerSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    logo: {
        type: String
    },
    location: {
        lat: {
            type: String
        },
        long: {
            type: String
        }
    }
});

module.exports = mongoose.model('dealers', dealerSchema);