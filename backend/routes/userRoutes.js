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
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', adminOnly, getUsers);
router.post('/', adminOnly, createUser);
router.get('/invites/pending', adminOnly, getPendingInvites);
router.post('/:id/resend-invite', adminOnly, resendInvite);
router.post('/:id/revoke-invite', adminOnly, revokeInvite);
router.get('/:id', adminOnly, getUserById);
router.put('/:id', adminOnly, updateUser);
router.delete('/:id', adminOnly, deleteUser);

module.exports = router;
