const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, admin, deviceController.addDevice);
router.get('/', protect, deviceController.getDevices);
router.delete('/:id', protect, admin, deviceController.deleteDevice);

module.exports = router;
