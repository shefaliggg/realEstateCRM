const crypto = require('crypto');

const OTP_DIGITS = 6;

const passwordPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const hashValue = (value) => crypto.createHash('sha256').update(value).digest('hex');

const generateInviteToken = () => crypto.randomBytes(32).toString('hex');

const generateOtp = () => {
  const min = 10 ** (OTP_DIGITS - 1);
  const max = 10 ** OTP_DIGITS - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
};

const isStrongPassword = (password) => passwordPolicyRegex.test(password || '');

module.exports = {
  hashValue,
  generateInviteToken,
  generateOtp,
  isStrongPassword,
};
