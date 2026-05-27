const { sequelize, User, Role, UserRole } = require('../src/models');

async function run() {
  try {
    await sequelize.authenticate();
    const [role] = await Role.findOrCreate({ where: { name: 'admin' }, defaults: { name: 'admin', description: 'Administrator' } });

    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const [user, created] = await User.findOrCreate({ where: { email: 'admin@example.com' }, defaults: { name: 'Admin', email: 'admin@example.com', password: adminPassword } });
    if (!created && user.password !== adminPassword) {
      await user.update({ password: adminPassword });
    }

    const t = await User.findByPk(1).catch(() => null);
    if (t && t.email === 'focus@example.com') {
    }

    const ur = await UserRole.findOne({ where: { userId: user.id, roleId: role.id } });
    if (!ur) await UserRole.create({ userId: user.id, roleId: role.id });

    console.log('Admin user ensured:', user.id, user.email, 'password:', adminPassword);
    process.exit(0);
  } catch (e) {
    console.error('Failed to create admin', e);
    process.exit(1);
  }
}

run();
