const mongoose = require('mongoose');
const Dashboard = require('./models/Dashboard');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/adas-dashboard';

const DUMMY_DEVICES = [
    { deviceName: 'Fleet Truck #01 Dashboard', deviceId: 'DEVICE_001', particleId: 'p1a2b3c4d5e6f001' },
    { deviceName: 'Fleet Truck #02 Dashboard', deviceId: 'DEVICE_002', particleId: 'p1a2b3c4d5e6f002' },
    { deviceName: 'Electric Van #01 Dashboard', deviceId: 'DEVICE_003', particleId: 'p1a2b3c4d5e6f003' },
];

async function seedDashboards() {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const users = await User.find({});
    if (users.length === 0) {
        console.log('❌ No users found in database. Create a user first before adding dashboards.');
        process.exit(1);
    }

    // Clear existing dashboards
    await Dashboard.deleteMany({});
    console.log('🗑  Cleared existing dashboards');

    let count = 0;
    for (const user of users) {
        for (const device of DUMMY_DEVICES) {
            await Dashboard.create({
                dashboardName: device.deviceName,
                deviceId: device.deviceId,
                particleId: device.particleId,
                user: user._id,
                description: 'Auto-generated dummy dashboard',
                enabledFeatures: ['ignition', 'batterySOC', 'batteryTemperature', 'batteryVoltage', 'speed', 'engineRPM', 'gps', 'flRadar', 'frRadar', 'rlRadar', 'rrRadar', 'lux', 'headlightStatus']
            });
            count++;
        }
    }

    console.log(`✅ Seeded ${count} dashboards across ${users.length} users.`);
    process.exit(0);
}

seedDashboards().catch(err => { console.error(err); process.exit(1); });
