const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
  getLeads, getLeadById, createLead, updateLead, deleteLead,
  addNote, addTask, completeTask,
} = require('../controllers/leadController')

router.route('/').get(protect, getLeads).post(protect, createLead)
router.route('/:id').get(protect, getLeadById).put(protect, updateLead).delete(protect, deleteLead)
router.post('/:id/notes', protect, addNote)
router.post('/:id/tasks', protect, addTask)
router.put('/:id/tasks/:taskId/complete', protect, completeTask)

module.exports = router
