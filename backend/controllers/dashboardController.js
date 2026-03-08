const Dashboard = require('../models/Dashboard');
const Device = require('../models/Device');
const crypto = require('crypto');

// Auto-generate a unique particle-style ID
const generateParticleId = () => crypto.randomBytes(12).toString('hex');

exports.createDashboard = async (req, res) => {
    try {
        const { dashboardName, deviceId, enabledFeatures, description } = req.body;

        if (!dashboardName || !deviceId) {
            return res.status(400).json({ message: 'Dashboard name and Device ID are required.' });
        }

        // Find or register the device
        let device = await Device.findOne({ deviceId });
        if (!device) {
            return res.status(404).json({ message: 'Device not found. Please register the device first in the Devices section.' });
        }

        // Auto-generate particle ID
        const particleId = generateParticleId();

        const dashboard = new Dashboard({
            dashboardName,
            particleId,
            deviceId,
            enabledFeatures: enabledFeatures || ['ignition', 'batterySOC', 'batteryTemperature', 'batteryVoltage', 'gps', 'dataLogging', 'dataDownload', 'deviceList', 'ota'],
            description: description || '',
            user: req.user._id
        });

        await dashboard.save();
        res.status(201).json({ message: 'Dashboard created successfully', dashboard });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getDashboards = async (req, res) => {
    try {
        const dashboards = await Dashboard.find({ user: req.user._id });
        res.status(200).json(dashboards);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteDashboard = async (req, res) => {
    try {
        const { id } = req.params;
        await Dashboard.findOneAndDelete({ _id: id, user: req.user._id });
        res.status(200).json({ message: 'Dashboard deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

