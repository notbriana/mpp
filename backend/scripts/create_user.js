const { sequelize, User } = require('../src/models');

async function run() {
  await sequelize.sync();
  const email = process.argv[2] || 'admin@example.com';
  const password = process.argv[3] || 'admin';
  const name = process.argv[4] || 'Admin';
  const exists = await User.findOne({ where: { email } });
  if (exists) {
    console.log('User already exists:', exists.toJSON());
    process.exit(0);
  }
  const u = await User.create({ name, email, password });
  console.log('Created user:', u.toJSON());
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
