const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, dashboardController.createDashboard);
router.get('/', protect, dashboardController.getDashboards);
router.delete('/:id', protect, dashboardController.deleteDashboard);

module.exports = router;
