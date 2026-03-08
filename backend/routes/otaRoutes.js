const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const otaController = require('../controllers/otaController');
const { protect, admin } = require('../middleware/authMiddleware');

// Storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Append timestamp to ensure uniqueness
        cb(null, `firmware-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        if (ext !== '.bin') {
            return cb(new Error('Only .bin files are allowed'));
        }
        cb(null, true);
    }
});

router.post('/upload-firmware', protect, upload.single('firmware'), otaController.uploadFirmware);
router.get('/check-update/:deviceId', otaController.checkUpdate); // Open for ESP32

module.exports = router;
