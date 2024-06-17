const mongoose = require('mongoose');

const notificationStorageSchema = mongoose.Schema({
    title: {
        type: String
    },
    body: {
        type: String
    },
    data: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    senderId: {
        type: String
    },
    receiverId: {
        type: String
    },
    category: {
        type: String
    },
    isSenderDealer: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('notifications', notificationStorageSchema)