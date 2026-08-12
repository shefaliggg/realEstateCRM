const express = require('express')
const router = express.Router()
const { protect, blockExternalUsers, requirePermission } = require('../middleware/authMiddleware')
const { attachTenantScope, requireBuilderScope } = require('../middleware/tenantMiddleware')
const {
  getLeads, getLeadById, createLead, updateLead, deleteLead,
  addNote, addTask, completeTask,
} = require('../controllers/leadController')

router.use(protect, attachTenantScope, requireBuilderScope, blockExternalUsers, requirePermission('module:Leads'))

router.route('/').get(getLeads).post(createLead)
router.route('/:id').get(getLeadById).put(updateLead).delete(deleteLead)
router.post('/:id/notes', addNote)
router.post('/:id/tasks', addTask)
router.put('/:id/tasks/:taskId/complete', completeTask)

module.exports = router
