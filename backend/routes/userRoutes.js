const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all users
router.get('/', protect, admin, userController.getUsers);

// Create user (Admin auto-verified)
router.post('/', protect, admin, userController.createUser);

// Update user
router.put('/:id', protect, admin, userController.updateUser);

// Delete user
router.delete('/:id', protect, admin, userController.deleteUser);

module.exports = router;
