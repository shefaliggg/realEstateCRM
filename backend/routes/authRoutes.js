const express = require('express');
const router = express.Router();
const {
	login,
	selectBuilder,
	listMyMemberships,
	getMe,
	seedAdmin,
	setPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { attachTenantScope } = require('../middleware/tenantMiddleware');

router.post('/login', login);
router.post('/set-password', setPassword);
router.post('/select-builder', protect, selectBuilder);
router.get('/memberships', protect, listMyMemberships);
router.get('/me', protect, attachTenantScope, getMe);

// One-time seed: creates first admin if none exists
router.post('/seed-admin', seedAdmin);

module.exports = router;
