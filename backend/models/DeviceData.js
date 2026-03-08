const mongoose = require('mongoose');

const deviceDataSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
    },
    ignitionStatus: {
        type: String,
        enum: ['ON', 'OFF'],
        default: 'OFF',
    },
    batteryTemperature: {
        type: Number,
    },
    batterySOC: {
        type: Number,
    },
    batteryVoltage: {
        type: Number,
    },
    gpsLatitude: {
        type: Number,
    },
    gpsLongitude: {
        type: Number,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('DeviceData', deviceDataSchema);
