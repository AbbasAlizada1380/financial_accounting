const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, updateSettings } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/me', protect, getProfile);
router.put('/me', protect, upload, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/settings', protect, updateSettings); // NEW

module.exports = router;