const path = require('path');
const fs = require('fs');
const Device = require('../models/Device');

exports.uploadFirmware = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const { deviceId } = req.body;

        // Optional: map this firmware to a specific deviceId in DB
        // Or save global latest firmware

        res.status(200).json({
            message: 'Firmware uploaded successfully',
            fileName: req.file.filename,
            deviceId: deviceId || 'global'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.checkUpdate = async (req, res) => {
    try {
        const { deviceId } = req.params;

        // In a real scenario, you'd check a DB record to see what firmware version applies to this deviceId
        // For now, we will just return the most recently uploaded file in the uploads dir

        const uploadsDir = path.join(__dirname, '../uploads');

        if (!fs.existsSync(uploadsDir)) {
            return res.status(404).json({ message: 'No updates available' });
        }

        const files = fs.readdirSync(uploadsDir);
        if (files.length === 0) {
            return res.status(404).json({ message: 'No updates available' });
        }

        // Sort files by modification time descending
        const sortedFiles = files.map(file => ({
            name: file,
            time: fs.statSync(path.join(uploadsDir, file)).mtime.getTime()
        })).sort((a, b) => b.time - a.time);

        const latestFirmware = sortedFiles[0].name;

        // Send the bin file
        const file = path.join(uploadsDir, latestFirmware);
        res.download(file); // This prompts a download

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
