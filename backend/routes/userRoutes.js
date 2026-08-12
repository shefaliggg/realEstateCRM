const express = require('express');
const router = express.Router();
const {
	getUsers,
	getUserById,
	updateUser,
	deleteUser,
	createUser,
	getPendingInvites,
	resendInvite,
	revokeInvite,
} = require('../controllers/userController');
const { protect, requirePermission } = require('../middleware/authMiddleware');
const { attachTenantScope, requireBuilderScope } = require('../middleware/tenantMiddleware');

router.use(protect, attachTenantScope, requireBuilderScope, requirePermission('manage_users'));

router.get('/', getUsers);
router.post('/', createUser);
router.get('/invites/pending', getPendingInvites);
router.post('/:id/resend-invite', resendInvite);
router.post('/:id/revoke-invite', revokeInvite);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
