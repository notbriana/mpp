const { sequelize, User } = require('../src/models');

async function run() {
  try {
    await sequelize.authenticate();
    const users = await User.findAll({ raw: true });
    if (!users.length) {
      console.log('No users found');
      process.exit(0);
    }
    console.log('Users:');
    users.forEach(u => {
      console.log(`- id=${u.id} name=${u.name} email=${u.email}`);
    });
    process.exit(0);
  } catch (e) {
    console.error('Failed to list users', e);
    process.exit(1);
  }
}

run();
