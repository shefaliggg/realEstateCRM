const express = require('express');
const router = express.Router();
const { login, getMe, seedAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/me', protect, getMe);

// One-time seed: creates first admin if none exists
router.post('/seed-admin', seedAdmin);

module.exports = router;
