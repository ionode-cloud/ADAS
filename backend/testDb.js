const mongoose = require('mongoose');

async function test() {
    await mongoose.connect('mongodb://127.0.0.1:27017/adas-dashboard');
    const User = mongoose.model('User', new mongoose.Schema({}));
    const Dashboard = mongoose.model('Dashboard', new mongoose.Schema({}));
    const Device = mongoose.model('Device', new mongoose.Schema({}));
    const DeviceData = mongoose.model('DeviceData', new mongoose.Schema({}));

    console.log('Users:', await User.countDocuments());
    console.log('Dashboards:', await Dashboard.countDocuments());
    console.log('Devices:', await Device.countDocuments());
    console.log('DeviceData:', await DeviceData.countDocuments());
    process.exit(0);
}
test();
