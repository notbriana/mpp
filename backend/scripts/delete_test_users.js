const { sequelize, User } = require('../src/models');

async function run() {
  try {
    await sequelize.authenticate();
    const toDelete = await User.findAll({ where: {
    }, raw: true }).catch(() => []);

    const candidates = await User.findAll({ raw: true });
    const dels = candidates.filter(u => {
      const name = String(u.name || '').toLowerCase();
      const email = String(u.email || '').toLowerCase();
      return name === 'test' || name === 'default' || email.includes('test') || email.includes('default');
    });

    if (!dels.length) { console.log('No test/default users found'); process.exit(0); }

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
