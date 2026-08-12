const User = require('../models/User');
const Membership = require('../models/Membership');
const Builder = require('../models/Builder');
const { generateTempPassword } = require('./security');
const { sendMail } = require('./email');

// `origin` is the actual URL the builder-facing frontend is running on right
// now (see utils/requestOrigin.js) — preferred over the static FRONTEND_URL
// env var when the caller can supply it, since it adapts automatically to
// whatever host/port/domain the browser is really using. FRONTEND_URL still
// wins when explicitly set (e.g. pinning to a canonical domain in production
// behind a proxy where Origin may not be trustworthy); localhost:5173 is only
// the last-resort fallback for non-browser callers (scripts, tests).
const buildLoginLink = (origin) => {
  const frontend = process.env.FRONTEND_URL || origin || 'http://localhost:5173';
  return `${frontend.replace(/\/$/, '')}/login`;
};

// `joiningExistingAccount` = the invited email already has a fully onboarded
// PropVault account (they're being added to a second builder), so there's no
// temp password to hand out — the copy just tells them where to log in.
const sendInviteMail = async ({ email, name, role, builderName, tempPassword, loginLink, joiningExistingAccount }) => {
  const subject = builderName
    ? `You're invited to join ${builderName} on PropVault`
    : 'You are invited to PropVault';
  const roleLabel = role.replace(/_/g, ' ');
  const text = joiningExistingAccount
    ? [
        `Hello ${name},`,
        '',
        `You have been invited to join ${builderName || 'a new organization'} as ${roleLabel}.`,
        `Log in with your existing PropVault account to switch into it: ${loginLink}`,
      ].join('\n')
    : [
        `Hello ${name},`,
        '',
        `You have been invited as ${roleLabel}${builderName ? ` at ${builderName}` : ''}.`,
        '',
        `Username: ${email}`,
        `Temporary password: ${tempPassword}`,
        '',
        `Log in here: ${loginLink}`,
        `You'll be asked to set a new password the first time you log in.`,
      ].join('\n');

  return sendMail({ to: email, subject, text });
};

// Invites PropVault's own platform staff to build/run the Platform Portal app.
const sendBuilderInviteMail = async ({ email, name, builderName, tempPassword, loginLink }) => {
  const subject = `Set up "${builderName}" on PropVault`;
  const text = [
    `Hello ${name},`,
    '',
    `PropVault has invited you to set up "${builderName}" as its organization admin.`,
    '',
    `Username: ${email}`,
    `Temporary password: ${tempPassword}`,
    '',
    `Log in here: ${loginLink}`,
    `You'll be asked to set a new password the first time you log in.`,
  ].join('\n');

  return sendMail({ to: email, subject, text });
};

// Creates (or reuses) a User account, plus a Membership tying it to a builder,
// and emails sign-in instructions. Shared by the Tier-2 "builder admin invites
// their team" flow (userController), the channel-partner invite flow
// (channelPartnerController), and the Tier-1 "PropVault invites a builder"
// flow (platformController, role: 'builder_admin').
//
// A person can belong to multiple builders under one login (see plan), so if
// the email already has a PropVault account, we don't create a second one —
// we attach a new Membership to the existing account instead. A brand-new
// account (or one still mid-onboarding from an earlier invite) gets a fresh
// temp password emailed to it; a fully onboarded account just gets notified
// and is activated immediately, no password step needed.
const createInvitedUser = async ({ name, email, role, builderId, invitedBy, channelPartner = null, customer = null, origin }) => {
  let user = await User.findOne({ email });
  const isNewAccount = !user;
  let tempPassword = null;

  if (!user) {
    tempPassword = generateTempPassword();
    user = await User.create({
      name,
      email,
      isActive: true,
      password: tempPassword,
      passwordSet: true,
      mustChangePassword: true,
      emailVerified: true,
    });
  } else if (user.mustChangePassword) {
    // Still mid-onboarding from an earlier invite — issue a fresh temp
    // password so this invite's email is guaranteed to work.
    tempPassword = generateTempPassword();
    user.password = tempPassword;
    await user.save();
  }

  let membership = await Membership.findOne({ userId: user._id, builderId });
  if (membership && membership.status !== 'revoked') {
    const err = new Error('This email already has an active or pending invite for this organization');
    err.statusCode = 400;
    throw err;
  }

  const joiningExistingAccount = !isNewAccount && !user.mustChangePassword;

  const membershipFields = {
    userId: user._id,
    builderId,
    role,
    channelPartner,
    customer,
    status: joiningExistingAccount ? 'active' : 'invited',
    inviteStatus: joiningExistingAccount ? 'accepted' : 'pending',
    invitedBy,
    activatedAt: joiningExistingAccount ? new Date() : null,
  };

  if (membership) {
    Object.assign(membership, membershipFields);
    await membership.save();
  } else {
    membership = await Membership.create(membershipFields);
  }

  const builder = await Builder.findById(builderId).select('name');
  const loginLink = buildLoginLink(origin);
  const mailResult = await sendInviteMail({
    email: user.email,
    name: user.name,
    role,
    builderName: builder?.name,
    tempPassword,
    loginLink,
    joiningExistingAccount,
  });

  return { user, membership, tempPassword, mailResult, isNewAccount, joiningExistingAccount };
};

module.exports = {
  createInvitedUser,
  buildLoginLink,
  sendInviteMail,
  sendBuilderInviteMail,
};
