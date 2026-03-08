const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const { protect } = require('../middleware/authMiddleware');

router.post('/device-data', dataController.receiveData); // Open API for ESP32
router.get('/history/:deviceId', protect, dataController.getHistory);
router.get('/download', protect, dataController.downloadExcel);

module.exports = router;
