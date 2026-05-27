const {
  User,
  Assignment,
  FocusToday,
  FocusAllTime,
  Log,
  Observation,
  Role,
  Permission,
  UserRole,
  RolePermission
} = require('../src/models');
const { resetStore, setFocusStats, getFocusStats } = require('../src/data/store');

describe('Database CRUD coverage', () => {
  beforeEach(async () => {
    await resetStore();
  });

  test('User CRUD', async () => {
    const created = await User.create({ name: 'Db User', email: 'dbuser@example.com', password: 'pass' });
    const found = await User.findOne({ where: { email: 'dbuser@example.com' } });
    expect(found.id).toBe(created.id);

    await found.update({ name: 'Db User Updated' });
    const updated = await User.findByPk(created.id);
    expect(updated.name).toBe('Db User Updated');

    await User.destroy({ where: { id: created.id } });
    const deleted = await User.findByPk(created.id);
    expect(deleted).toBeNull();
  });

  test('Assignment CRUD', async () => {
    const user = await User.create({ name: 'Assign User', email: 'assigner@example.com', password: 'pass' });
    const created = await Assignment.create({
      userId: user.id,
      title: 'Assignment A',
      course_name: 'CS 101',
      due_date: '2026-04-29',
      priority: 'High',
      status: 'Not Started',
      description: 'Test',
      created_at: '2026-04-01'
    });

    const found = await Assignment.findByPk(created.id);
    expect(found.title).toBe('Assignment A');

    await found.update({ status: 'Completed' });
    const updated = await Assignment.findByPk(created.id);
    expect(updated.status).toBe('Completed');

    await Assignment.destroy({ where: { id: created.id } });
    const deleted = await Assignment.findByPk(created.id);
    expect(deleted).toBeNull();
  });

  test('Focus stats CRUD via store', async () => {
    const user = await User.create({ name: 'Focus User', email: 'focus@example.com', password: 'pass' });
    const today = { date: '2026-04-29', sessions: 1, focusSecs: 1200 };
    const allTime = { totalSecs: 1200, streak: 1, lastActiveDate: '2026-04-29' };

    await setFocusStats(user.id, { today, allTime });
    const stats = await getFocusStats(user.id);
    expect(stats.today.sessions).toBe(1);

    await setFocusStats(user.id, { today: { ...today, sessions: 2 }, allTime: { ...allTime, totalSecs: 2400 } });
    const updated = await getFocusStats(user.id);
    expect(updated.today.sessions).toBe(2);
    expect(updated.allTime.totalSecs).toBe(2400);

    const t = await FocusToday.findByPk(user.id);
    const a = await FocusAllTime.findByPk(user.id);
    expect(t).not.toBeNull();
    expect(a).not.toBeNull();
  });

  test('Roles and permissions CRUD', async () => {
    const role = await Role.create({ name: 'editor', description: 'Edit content' });
    const perm = await Permission.create({ name: 'content:edit', description: 'Edit content' });

    await RolePermission.create({ roleId: role.id, permissionId: perm.id });
    const rp = await RolePermission.findOne({ where: { roleId: role.id, permissionId: perm.id } });
    expect(rp).not.toBeNull();

    await role.update({ description: 'Edit content updated' });
    const updatedRole = await Role.findByPk(role.id);
    expect(updatedRole.description).toBe('Edit content updated');

    await Permission.destroy({ where: { id: perm.id } });
    const deletedPerm = await Permission.findByPk(perm.id);
    expect(deletedPerm).toBeNull();
  });

  test('Logs and observations CRUD', async () => {
    const user = await User.create({ name: 'Log User', email: 'log@example.com', password: 'pass' });
    const log = await Log.create({ userId: user.id, action: 'test:action', details: 'details' });
    const foundLog = await Log.findByPk(log.id);
    expect(foundLog.action).toBe('test:action');

    const obs = await Observation.create({ userId: user.id, reason: 'suspicious', severity: 'high', resolved: false });
    const foundObs = await Observation.findByPk(obs.id);
    expect(foundObs.resolved).toBe(false);

    await foundObs.update({ resolved: true, resolved_at: new Date('2026-04-29') });
    const updatedObs = await Observation.findByPk(obs.id);
    expect(updatedObs.resolved).toBe(true);

    await Observation.destroy({ where: { id: obs.id } });
    const deletedObs = await Observation.findByPk(obs.id);
    expect(deletedObs).toBeNull();
  });

  test('User role assignment CRUD', async () => {
    const user = await User.create({ name: 'Role User', email: 'roleuser@example.com', password: 'pass' });
    const role = await Role.create({ name: 'member', description: 'Member role' });

    const link = await UserRole.create({ userId: user.id, roleId: role.id });
    const found = await UserRole.findOne({ where: { id: link.id } });
    expect(found).not.toBeNull();

    await UserRole.destroy({ where: { id: link.id } });
    const deleted = await UserRole.findByPk(link.id);
    expect(deleted).toBeNull();
  });
});
