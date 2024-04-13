const mongoose = require('mongoose');

const dealerRatingSchema = mongoose.Schema({
    dealerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "dealers"
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    customerName: {
        type: String
    },
    finalRating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
        validate: {
            validator: function (value) {
                return value <= 5;
            },
            message: 'Rating should not be more than 5.',
        },
    },
    communication: {
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
            validate: {
                validator: function (value) {
                    return value <= 5;
                },
                message: 'Rating should not be more than 5.',
            },
        },
        comment: {
            type: String
        }
    },
    service: {
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
            validate: {
                validator: function (value) {
                    return value <= 5;
                },
                message: 'Rating should not be more than 5.',
            },
        },
        comment: {
            type: String
        }
    },
    vehicle: {
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
            validate: {
                validator: function (value) {
                    return value <= 5;
                },
                message: 'Rating should not be more than 5.',
            },
        },
        comment: {
            type: String
        }
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('dealerRatings', dealerRatingSchema);