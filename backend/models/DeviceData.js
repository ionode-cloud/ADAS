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
    speed: {
        type: Number,
        default: 0,
    },
    engineRPM: {
        type: Number,
        default: 0,
    },
    flRadar: {
        type: Number,
    },
    frRadar: {
        type: Number,
    },
    rlRadar: {
        type: Number,
    },
    rrRadar: {
        type: Number,
    },
    brakeStatus: {
        type: String,
        enum: ['APPLIED', 'RELEASED'],
        default: 'RELEASED',
    },
    lux: {
        type: Number,
    },
    headlightStatus: {
        type: String,
        enum: ['ON', 'OFF'],
        default: 'OFF',
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('DeviceData', deviceDataSchema);
