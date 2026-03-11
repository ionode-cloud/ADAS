const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protected standard user routes
router.get('/', protect, dashboardController.getDashboards);

// Protected AMIN ONLY routes
router.post('/', protect, admin, dashboardController.createDashboard);
router.delete('/:id', protect, admin, dashboardController.deleteDashboard);

module.exports = router;
