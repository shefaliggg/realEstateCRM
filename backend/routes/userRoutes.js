const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser, createUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', adminOnly, getUsers);
router.post('/', adminOnly, createUser);
router.get('/:id', getUserById);
router.put('/:id', adminOnly, updateUser);
router.delete('/:id', adminOnly, deleteUser);

module.exports = router;
