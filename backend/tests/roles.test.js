const { sequelize, Role, Permission, User, UserRole, RolePermission } = require('../src/models');
const { resetStore } = require('../src/data/store');

describe('Roles and Permissions (DB)', () => {
  beforeEach(async () => {
    await resetStore();
  });

  test('create role and permission and link them', async () => {
    const role = await Role.create({ name: 'tester', description: 'test role' });
    const perm = await Permission.create({ name: 'test:action', description: 'test perm' });

    await RolePermission.create({ roleId: role.id, permissionId: perm.id });

    const rp = await RolePermission.findOne({ where: { roleId: role.id, permissionId: perm.id } });
    expect(rp).not.toBeNull();
  });

  test('assign role to user and query associations', async () => {
    const user = await User.create({ name: 'R User', email: 'ruser@example.com', password: 'pass' });
    const role = await Role.create({ name: 'member', description: 'member role' });

    await UserRole.create({ userId: user.id, roleId: role.id });

    const ur = await UserRole.findOne({ where: { userId: user.id, roleId: role.id } });
    expect(ur).not.toBeNull();

    const roles = await user.getRoles();
    expect(roles.map(r => r.name)).toContain('member');
  });
});
