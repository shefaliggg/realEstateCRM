const Builder = require('../models/Builder');
const { recordAudit } = require('../utils/auditLog');

// @desc  Get the current builder's own company profile
// @route GET /api/builder/me
const getMyBuilder = async (req, res) => {
  try {
    const builder = await Builder.findById(req.builderId);
    if (!builder) return res.status(404).json({ message: 'Company not found' });
    res.json(builder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update the current builder's own editable profile fields —
//        slug/status/billingPlan stay platform-controlled, not self-service.
// @route PUT /api/builder/me
const updateMyBuilder = async (req, res) => {
  try {
    const { name, contactEmail, contactPhone } = req.body;
    const builder = await Builder.findById(req.builderId);
    if (!builder) return res.status(404).json({ message: 'Company not found' });

    if (name !== undefined) builder.name = name;
    if (contactEmail !== undefined) builder.contactEmail = contactEmail;
    if (contactPhone !== undefined) builder.contactPhone = contactPhone;
    const updated = await builder.save();

    recordAudit({
      builderId: req.builderId,
      actor: req.user._id,
      action: 'company_profile_updated',
      targetType: 'Builder',
      targetId: builder._id,
      metadata: { name, contactEmail, contactPhone },
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getMyBuilder, updateMyBuilder };
