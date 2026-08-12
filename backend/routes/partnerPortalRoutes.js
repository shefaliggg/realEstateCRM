const express = require('express');
const router = express.Router();
const { protect, requireChannelPartner, requirePartnerAdmin } = require('../middleware/authMiddleware');
const { attachTenantScope, requireBuilderScope } = require('../middleware/tenantMiddleware');
const {
  getMe,
  updateMe,
  getProjects,
  getInventory,
  getLeads,
  registerLead,
  getBookings,
  getCommissions,
  getTeam,
  inviteAgent,
  updateTeamMember,
  assignLead,
  getDownloads,
} = require('../controllers/partnerPortalController');

router.use(protect, attachTenantScope, requireBuilderScope, requireChannelPartner);

router.route('/me').get(getMe).put(updateMe);
router.get('/projects', getProjects);
router.get('/inventory', getInventory);
router.route('/leads').get(getLeads).post(registerLead);
router.put('/leads/:id/assign', requirePartnerAdmin, assignLead);
router.get('/bookings', getBookings);
router.get('/commissions', getCommissions);
router.route('/team').get(getTeam).post(requirePartnerAdmin, inviteAgent);
router.put('/team/:membershipId', requirePartnerAdmin, updateTeamMember);
router.get('/downloads', getDownloads);

module.exports = router;
