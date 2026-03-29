const DeviceData = require('../models/DeviceData');
const Device = require('../models/Device');

// Store battery SOC, battery voltage, battery temperature, ignition status, GPS latitude, GPS longitude.
exports.storeVehicleData = async (req, res) => {
    try {
        const { deviceId, batterySOC, batteryVoltage, batteryTemperature, motorTemperature, ignitionStatus, gpsLatitude, gpsLongitude, speed, engineRPM } = req.body;

        const newData = new DeviceData({
            deviceId,
            batterySOC,
            batteryVoltage,
            batteryTemperature,
            motorTemperature,
            ignitionStatus,
            gpsLatitude,
            gpsLongitude,
            speed,
            engineRPM
        });

        await newData.save();

        // Update device last seen
        await Device.findOneAndUpdate({ deviceId }, { lastSeen: new Date() });

        // Emit via Socket.io if needed
        if (req.io) {
            req.io.emit('newData', newData);
        }

        res.status(201).json({ message: 'Vehicle data stored successfully', data: newData });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Return latest vehicle data.
exports.getLatestVehicleData = async (req, res) => {
    try {
        const { deviceId } = req.query;
        if (!deviceId) {
            return res.status(400).json({ message: 'Device ID is required' });
        }
        const latest = await DeviceData.findOne({ deviceId }).sort({ timestamp: -1 });
        res.status(200).json(latest || {});
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Return previous data logs.
exports.getVehicleHistory = async (req, res) => {
    try {
        const { deviceId, limit = 50 } = req.query;
         if (!deviceId) {
            return res.status(400).json({ message: 'Device ID is required' });
        }
        const history = await DeviceData.find({ deviceId }).sort({ timestamp: -1 }).limit(parseInt(limit));
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update ignition status for a device
exports.updateIgnitionStatus = async (req, res) => {
    try {
        const { deviceId, status } = req.body;
        if (!deviceId || !status) {
            return res.status(400).json({ message: 'Device ID and status are required' });
        }
        
        const validStatuses = ['ON', 'OFF'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be ON or OFF' });
        }

        const latest = await DeviceData.findOne({ deviceId }).sort({ timestamp: -1 });
        if (!latest) {
            return res.status(404).json({ message: 'No vehicle data found for this device' });
        }

        latest.ignitionStatus = status;
        await latest.save();

        if (req.io) {
            req.io.emit('newData', latest);
        }

        res.status(200).json({ message: `Ignition turned ${status}`, data: latest });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
