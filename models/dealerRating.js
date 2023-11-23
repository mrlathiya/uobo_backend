const mongoose = require('mongoose');

const dealerRatingSchema = mongoose.Schema({
    dealerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "dealers"
    },
    finalRating: {
        type: String
    },
    communication: {
        rating: {
            type: String
        },
        comment: {
            type: String
        }
    },
    service: {
        rating: {
            type: String
        },
        comment: {
            type: String
        }
    },
    vehicle: {
        rating: {
            type: String
        },
        comment: {
            type: String
        }
    }
});

module.exports = mongoose.model('dealerRatings', dealerRatingSchema);