// Account-level fields only — role/builderId/membershipId are per-membership
// and are merged in by the caller (see authController.js, userController.js).
const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone ?? null,
  isActive: user.isActive,
  passwordSet: user.passwordSet,
  emailVerified: user.emailVerified,
  onboardingCompletedAt: user.onboardingCompletedAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

module.exports = { sanitizeUser };
