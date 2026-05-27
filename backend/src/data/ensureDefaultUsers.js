const { User } = require('../models');

async function ensureDefaultUsers() {
  const email = process.env.DEFAULT_USER_EMAIL || 'usera@example.com';
  const password = process.env.DEFAULT_USER_PASSWORD || 'password123';
  const name = process.env.DEFAULT_USER_NAME || 'Default User';

  try {
    await User.findOrCreate({
      where: { email },
      defaults: { name, password }
    });
  } catch (err) {
    console.error('ensureDefaultUsers error:', err);
  }
}

module.exports = ensureDefaultUsers;
