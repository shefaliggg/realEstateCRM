const express = require('express');
const router = express.Router();
const {
	login,
	getMe,
	seedAdmin,
	validateInvite,
	acceptInvite,
	resendInviteOtp,
	verifyInviteOtp,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/invite/:token', validateInvite);
router.post('/invite/accept', acceptInvite);
router.post('/invite/resend-otp', resendInviteOtp);
router.post('/invite/verify-otp', verifyInviteOtp);

// One-time seed: creates first admin if none exists
router.post('/seed-admin', seedAdmin);

module.exports = router;
