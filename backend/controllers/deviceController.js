const Device = require('../models/Device');

// Add new device
exports.addDevice = async (req, res) => {
    try {
        const { deviceName, deviceId, location } = req.body;

        const existingDevice = await Device.findOne({ deviceId });
        if (existingDevice) {
            return res.status(400).json({ message: 'Device ID already exists' });
        }

        const device = new Device({
            deviceName,
            deviceId,
            location,
        });

        await device.save();
        res.status(201).json({ message: 'Device added successfully', device });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all devices
exports.getDevices = async (req, res) => {
    try {
        const devices = await Device.find().sort({ createdAt: -1 });

        // Check status based on last seen timestamp (e.g., offline if more than 5 minutes ago)
        const devicesWithStatus = devices.map(device => {
            const now = new Date();
            const lastSeen = new Date(device.lastSeen);
            const diffMs = now - lastSeen;
            let status = diffMs > 5 * 60 * 1000 ? 'Offline' : 'Online';

            // Force dummy/demo devices to be always Online
            if (device.deviceId === 'DEVICE_002' || device.deviceId === 'DEV-001') {
                status = 'Online';
            }

            return { ...device._doc, status };
        });

        res.status(200).json(devicesWithStatus);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete device
exports.deleteDevice = async (req, res) => {
    try {
        const { id } = req.params;
        await Device.findByIdAndDelete(id);
        res.status(200).json({ message: 'Device deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
