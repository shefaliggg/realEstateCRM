const express = require('express');
const router = express.Router();
const { protect, requirePermission } = require('../middleware/authMiddleware');
const { attachTenantScope, requireBuilderScope } = require('../middleware/tenantMiddleware');
const {
  getChannelPartners,
  getChannelPartnerById,
  updateChannelPartner,
  createChannelPartner,
} = require('../controllers/channelPartnerController');

router.use(protect, attachTenantScope, requireBuilderScope, requirePermission('module:Channel Partners'));

router.route('/')
  .get(getChannelPartners)
  .post(createChannelPartner);

router.route('/:id')
  .get(getChannelPartnerById)
  .put(updateChannelPartner);

module.exports = router;
