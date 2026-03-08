// seed.js — Run with: node seed.js
// Seeds dummy devices and telemetry data into MongoDB

require('dotenv/config');
const mongoose = require('mongoose');

const Device = require('./models/Device');
const DeviceData = require('./models/DeviceData');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/adas-dashboard';

const DUMMY_DEVICES = [
    { deviceName: 'Fleet Truck #01', deviceId: 'DEVICE_001', particleId: 'p1a2b3c4d5e6f001', lastSeen: new Date() },
    { deviceName: 'Fleet Truck #02', deviceId: 'DEVICE_002', particleId: 'p1a2b3c4d5e6f002', lastSeen: new Date() },
    { deviceName: 'Electric Van #01', deviceId: 'DEVICE_003', particleId: 'p1a2b3c4d5e6f003', lastSeen: new Date(Date.now() - 10 * 60 * 1000) },
];

// Generate realistic telemetry rows for each device
function generateTelemetryRows(deviceId, count = 30) {
    const rows = [];
    let soc = 80, voltage = 52.4, temp = 28;
    const now = Date.now();

    for (let i = count; i >= 0; i--) {
        soc = Math.max(10, Math.min(100, soc + (Math.random() - 0.52) * 2));
        voltage = Math.max(42, Math.min(58, voltage + (Math.random() - 0.52) * 0.3));
        temp = Math.max(20, Math.min(50, temp + (Math.random() - 0.5) * 1.5));

        rows.push({
            deviceId,
            ignitionStatus: Math.random() > 0.2 ? 'ON' : 'OFF',
            batterySOC: parseFloat(soc.toFixed(1)),
            batteryVoltage: parseFloat(voltage.toFixed(2)),
            batteryTemperature: parseFloat(temp.toFixed(1)),
            gpsLatitude: 18.5204 + (Math.random() - 0.5) * 0.05,
            gpsLongitude: 73.8567 + (Math.random() - 0.5) * 0.05,
            timestamp: new Date(now - i * 5 * 60 * 1000), // every 5 min
        });
    }
    return rows;
}

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing
    await Device.deleteMany({});
    await DeviceData.deleteMany({});
    console.log('🗑  Cleared existing data');

    // Insert devices
    const devices = await Device.insertMany(DUMMY_DEVICES);
    console.log(`📡 Inserted ${devices.length} devices`);

    // Insert telemetry for each device
    for (const device of devices) {
        const rows = generateTelemetryRows(device.deviceId, 30);
        await DeviceData.insertMany(rows);
        console.log(`   📊 ${device.deviceName} → ${rows.length} telemetry records`);
    }

    console.log('\n✅ Seed complete!');
    console.log('\n--- Device IDs for testing ---');
    devices.forEach(d => console.log(`  ${d.deviceName}: ${d.deviceId}`));
    process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
