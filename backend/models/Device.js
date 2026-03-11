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
    location: {
        type: String,
        required: true,
    },
    lastSeen: {
        type: Date,
        default: Date.now,
    },
    otaUpdatePending: {
        type: Boolean,
        default: false,
    },
    otaFirmwareUrl: {
        type: String,
        default: "",
    }
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
