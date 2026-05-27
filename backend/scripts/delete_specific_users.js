const { sequelize, User } = require('../src/models');

async function run() {
  try {
    await sequelize.authenticate();
    const targets = ['Test User', 'Default User'];
    const users = await User.findAll({ raw: true });
    const dels = users.filter(u => targets.includes(u.name));
    if (!dels.length) {
      console.log('No matching users to delete');
      process.exit(0);
    }
    for (const u of dels) {
      console.log('Deleting user', u.id, u.email, u.name);
      await User.destroy({ where: { id: u.id } });
    }
    console.log('Done');
    process.exit(0);
  } catch (e) {
    console.error('Failed', e);
    process.exit(1);
  }
}

run();
