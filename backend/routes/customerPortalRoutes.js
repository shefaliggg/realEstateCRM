const express = require('express');
const router = express.Router();
const { protect, requireCustomer } = require('../middleware/authMiddleware');
const { attachTenantScope, requireBuilderScope } = require('../middleware/tenantMiddleware');
const {
  getMe,
  updateMe,
  getBookings,
  getPaymentSchedule,
  getPayments,
  getConstructionUpdates,
  getDocuments,
  getSupportInfo,
} = require('../controllers/customerPortalController');

router.use(protect, attachTenantScope, requireBuilderScope, requireCustomer);

router.route('/me').get(getMe).put(updateMe);
router.get('/bookings', getBookings);
router.get('/payment-schedule', getPaymentSchedule);
router.get('/payments', getPayments);
router.get('/construction-updates', getConstructionUpdates);
router.get('/documents', getDocuments);
router.get('/support', getSupportInfo);

module.exports = router;
