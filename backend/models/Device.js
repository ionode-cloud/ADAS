const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    deviceName: {
        type: String,
        required: true,
    },
    deviceId: {
        type: String,
        required: true,
        unique: true,
    },
    particleId: {
        type: String,
        required: true,
    },
    lastSeen: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
