const Builder = require('../models/Builder');
const Membership = require('../models/Membership');
const AuditLog = require('../models/AuditLog');
const { generateTempPassword } = require('../utils/security');
const { createInvitedUser, buildLoginLink, sendBuilderInviteMail } = require('../utils/inviteUser');
const { recordAudit } = require('../utils/auditLog');
const { deriveBuilderFrontendOrigin } = require('../utils/requestOrigin');
const { sanitizeUser } = require('../utils/sanitizeUser');

const slugify = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const sanitizeBuilder = (builder) => ({
  _id: builder._id,
  name: builder.name,
  slug: builder.slug,
  status: builder.status,
  contactEmail: builder.contactEmail,
  contactPhone: builder.contactPhone,
  billingPlan: builder.billingPlan,
  activatedAt: builder.activatedAt,
  createdAt: builder.createdAt,
  updatedAt: builder.updatedAt,
});

// @desc  Invite a new builder org onto PropVault, creating (or reusing) its
//        first builder_admin account. Mirrors userController.createUser's
//        Tier-2 flow, but provisions the Builder itself first.
// @route POST /api/platform/builders
const inviteBuilder = async (req, res) => {
  try {
    const { name, slug, contactEmail, contactPhone, adminName, adminEmail } = req.body;
    if (!name || !adminName || !adminEmail) {
      return res.status(400).json({ message: 'Please provide the builder name and its first admin name/email' });
    }

    const finalSlug = slug ? slugify(slug) : slugify(name);
    const slugTaken = await Builder.findOne({ slug: finalSlug });
    if (slugTaken) {
      return res.status(400).json({ message: 'A builder with that slug already exists' });
    }

    const builder = await Builder.create({
      name,
      slug: finalSlug,
      status: 'pending',
      contactEmail,
      contactPhone,
      createdBy: req.user._id,
    });

    // Builder admins log in through the builder-facing app, not this admin
    // app, so the invite mail must point there even though this request
    // landed on the admin app's own origin.
    const { user, membership, isNewAccount, tempPassword, mailResult } = await createInvitedUser({
      name: adminName,
      email: adminEmail,
      role: 'builder_admin',
      builderId: builder._id,
      invitedBy: req.user._id,
      origin: deriveBuilderFrontendOrigin(req),
    });

    recordAudit({
      builderId: null,
      actor: req.user._id,
      action: 'builder_invited',
      targetType: 'Builder',
      targetId: builder._id,
      metadata: { name: builder.name, adminEmail },
    });

    res.status(201).json({
      builder: sanitizeBuilder(builder),
      admin: sanitizeUser(user),
      isNewAccount,
      invite: {
        delivery: mailResult.sent ? 'email' : 'not_configured',
        membershipId: membership._id,
        // Dev convenience only — in production this only ever goes out by email.
        username: process.env.NODE_ENV === 'production' ? undefined : user.email,
        tempPassword: process.env.NODE_ENV === 'production' ? undefined : tempPassword,
      },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// @desc  List all builders on the platform
// @route GET /api/platform/builders
const listBuilders = async (req, res) => {
  try {
    const builders = await Builder.find().sort({ createdAt: -1 });
    res.json(builders.map(sanitizeBuilder));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get one builder
// @route GET /api/platform/builders/:id
const getBuilder = async (req, res) => {
  try {
    const builder = await Builder.findById(req.params.id);
    if (!builder) return res.status(404).json({ message: 'Builder not found' });
    res.json(sanitizeBuilder(builder));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Resend the first-admin invite for a builder that hasn't activated yet
// @route POST /api/platform/builders/:id/resend-invite
const resendBuilderInvite = async (req, res) => {
  try {
    const builder = await Builder.findById(req.params.id);
    if (!builder) return res.status(404).json({ message: 'Builder not found' });
    if (builder.status === 'active') {
      return res.status(400).json({ message: 'Builder has already activated' });
    }

    const membership = await Membership.findOne({ builderId: builder._id, role: 'builder_admin' })
      .sort({ createdAt: 1 })
      .populate('userId', 'name email');
    if (!membership) return res.status(404).json({ message: 'No pending admin invite found for this builder' });

    const user = membership.userId;
    const tempPassword = generateTempPassword();
    user.password = tempPassword;
    user.mustChangePassword = true;
    await user.save();

    membership.status = 'invited';
    membership.inviteStatus = 'pending';
    await membership.save();

    const loginLink = buildLoginLink(deriveBuilderFrontendOrigin(req));
    const mailResult = await sendBuilderInviteMail({
      email: user.email,
      name: user.name,
      builderName: builder.name,
      tempPassword,
      loginLink,
    });

    res.json({
      message: 'Invite resent',
      invite: {
        delivery: mailResult.sent ? 'email' : 'not_configured',
        username: process.env.NODE_ENV === 'production' ? undefined : user.email,
        tempPassword: process.env.NODE_ENV === 'production' ? undefined : tempPassword,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Suspend/reactivate a builder. Enforced at attachTenantScope, so
//        this takes effect on the builder's very next request — no bulk
//        user update needed.
// @route POST /api/platform/builders/:id/suspend
const suspendBuilder = async (req, res) => {
  try {
    const { suspend = true } = req.body;
    const builder = await Builder.findById(req.params.id);
    if (!builder) return res.status(404).json({ message: 'Builder not found' });

    builder.status = suspend ? 'suspended' : 'active';
    await builder.save();

    recordAudit({
      builderId: builder._id,
      actor: req.user._id,
      action: suspend ? 'builder_suspended' : 'builder_reactivated',
      targetType: 'Builder',
      targetId: builder._id,
      metadata: {},
    });

    res.json(sanitizeBuilder(builder));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Cross-builder audit log, for PropVault platform staff
// @route GET /api/platform/audit-logs
const getPlatformAuditLogs = async (req, res) => {
  try {
    const { builderId } = req.query;
    const filter = builderId ? { builderId } : {};
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(500)
      .populate('actor', 'name email')
      .populate('builderId', 'name slug');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  inviteBuilder,
  listBuilders,
  getBuilder,
  resendBuilderInvite,
  suspendBuilder,
  getPlatformAuditLogs,
};
