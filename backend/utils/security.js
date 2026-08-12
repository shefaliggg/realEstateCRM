const crypto = require('crypto');

const passwordPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const hashValue = (value) => crypto.createHash('sha256').update(value).digest('hex');

const isStrongPassword = (password) => passwordPolicyRegex.test(password || '');

// Random pick helper used only for temp-password generation below.
const pickChars = (alphabet, count) =>
  Array.from({ length: count }, () => alphabet[crypto.randomInt(alphabet.length)]).join('');

// Generates a one-time login password for invited accounts. Guaranteed to
// satisfy isStrongPassword (one char from each required class, shuffled so
// the classes aren't positionally predictable).
const generateTempPassword = () => {
  const upper = pickChars('ABCDEFGHJKLMNPQRSTUVWXYZ', 3);
  const lower = pickChars('abcdefghijkmnpqrstuvwxyz', 3);
  const digits = pickChars('23456789', 3);
  const special = pickChars('!@#$%^&*', 2);
  const chars = `${upper}${lower}${digits}${special}`.split('');
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
};

module.exports = {
  hashValue,
  isStrongPassword,
  generateTempPassword,
};
