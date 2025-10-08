const express = require('express');
const router = express.Router();
const { getUsers, updateUserStatus } = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', protect, isAdmin, getUsers);

// @route   PUT /api/users/:id/status
// @desc    Update a user's account status (Admin only)
// @access  Private/Admin
router.put('/:id/status', protect, isAdmin, updateUserStatus);

module.exports = router;