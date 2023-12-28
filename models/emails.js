const mongoose = require('mongoose');

const userEmailSchema = mongoose.Schema({
    email: {
        type: String,
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('emails', userEmailSchema);