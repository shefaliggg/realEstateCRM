// One-off backfill: turns today's single-tenant dataset into "Builder #1" so
// nothing breaks once the builderId-scoped code (tenant middleware + scoped
// controllers) ships. Run manually, once, BEFORE deploying that code:
//
//   node backend/scripts/migrateToMultiTenant.js
//
// Dry-run against a staging copy of the database first. This script is
// idempotent-ish (steps guard against re-running on already-migrated data)
// but is not a substitute for a backup.

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Builder = require('../models/Builder');
const Membership = require('../models/Membership');
const User = require('../models/User');
const Project = require('../models/Project');
const Tower = require('../models/Tower');
const Unit = require('../models/Unit');
const Lead = require('../models/Lead');
const Deal = require('../models/Deal');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const PaymentSchedule = require('../models/PaymentSchedule');
const Payment = require('../models/Payment');
const ChannelPartner = require('../models/ChannelPartner');
const AuditLog = require('../models/AuditLog');

const DEFAULT_BUILDER_SLUG = process.env.MIGRATION_DEFAULT_BUILDER_SLUG || 'default';
const DEFAULT_BUILDER_NAME = process.env.MIGRATION_DEFAULT_BUILDER_NAME || 'Default Organization';

const ORG_SCOPED_MODELS = [
  Project,
  Tower,
  Unit,
  Lead,
  Deal,
  Booking,
  Customer,
  PaymentSchedule,
  Payment,
  ChannelPartner,
  AuditLog,
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Step 1 — create (or reuse) the default Builder.
  let builder = await Builder.findOne({ slug: DEFAULT_BUILDER_SLUG });
  if (builder) {
    console.log(`Default builder already exists: ${builder._id}`);
  } else {
    builder = await Builder.create({
      name: DEFAULT_BUILDER_NAME,
      slug: DEFAULT_BUILDER_SLUG,
      status: 'active',
      activatedAt: new Date(),
    });
    console.log(`Created default builder: ${builder._id}`);
  }
  const builderId = builder._id;

  // Step 2/3 — every pre-existing User becomes a Membership on the default
  // builder. Old role 'admin' -> 'builder_admin' Membership role. The User
  // doc itself is emptied of role/channelPartner (those now live on Membership).
  const legacyUsers = await User.find({
    role: { $in: [...require('../models/User').ROLE_ENUM, 'admin'] },
  }).select('+password');

  let membershipsCreated = 0;
  for (const user of legacyUsers) {
    const existingMembership = await Membership.findOne({ userId: user._id, builderId });
    if (existingMembership) continue;

    const legacyRole = user.role === 'admin' ? 'builder_admin' : user.role;
    // channelPartner is no longer a schema path on User (moved to Membership) —
    // read the raw stored value straight off the hydrated doc rather than via
    // schema-path accessors, which would no-op for an undeclared path.
    const legacyChannelPartner = user._doc.channelPartner || null;

    await Membership.create({
      userId: user._id,
      builderId,
      role: legacyRole,
      channelPartner: legacyChannelPartner,
      status: user.emailVerified && user.passwordSet ? 'active' : 'invited',
      inviteStatus: user.emailVerified && user.passwordSet ? 'accepted' : 'pending',
      activatedAt: user.onboardingCompletedAt || null,
    });
    membershipsCreated += 1;

    // Raw update (not .save()) since role/channelPartner are no longer schema
    // paths — Mongoose would silently no-op an assignment to an undeclared path.
    await User.collection.updateOne({ _id: user._id }, { $unset: { role: 1, channelPartner: 1 } });
  }
  console.log(`Created ${membershipsCreated} memberships for pre-existing users`);

  // Step 4 — backfill builderId on every org-scoped collection.
  for (const Model of ORG_SCOPED_MODELS) {
    const result = await Model.updateMany(
      { builderId: { $exists: false } },
      { $set: { builderId } }
    );
    console.log(`${Model.modelName}: backfilled ${result.modifiedCount ?? result.nModified ?? 0} documents`);
  }

  // Step 5 — provision the first real platform_admin, if none exists yet.
  // Do NOT auto-promote any builder_admin — this is a fresh PropVault-operator account.
  const platformAdminEmail = process.env.MIGRATION_PLATFORM_ADMIN_EMAIL;
  const platformAdminPassword = process.env.MIGRATION_PLATFORM_ADMIN_PASSWORD;
  const platformAdminName = process.env.MIGRATION_PLATFORM_ADMIN_NAME || 'PropVault Admin';

  const existingPlatformAdmin = await User.findOne({ role: 'platform_admin' });
  if (existingPlatformAdmin) {
    console.log('A platform_admin account already exists — skipping seed');
  } else if (!platformAdminEmail || !platformAdminPassword) {
    console.log(
      'No platform_admin exists yet, and MIGRATION_PLATFORM_ADMIN_EMAIL/PASSWORD were not set — ' +
        'skipping. Provision one later via POST /api/auth/seed-admin.'
    );
  } else {
    await User.create({
      name: platformAdminName,
      email: platformAdminEmail,
      password: platformAdminPassword,
      role: 'platform_admin',
      passwordSet: true,
      emailVerified: true,
      onboardingCompletedAt: new Date(),
    });
    console.log(`Created platform_admin account: ${platformAdminEmail}`);
  }

  // Step 6 — sanity check: nothing should be missing builderId now.
  for (const Model of ORG_SCOPED_MODELS) {
    const missing = await Model.countDocuments({ builderId: { $exists: false } });
    if (missing > 0) {
      console.warn(`WARNING: ${Model.modelName} still has ${missing} documents without builderId`);
    }
  }

  console.log('Migration complete.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
