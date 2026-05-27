module.exports = {
  async up(queryInterface) {
    const perms = await queryInterface.sequelize.query('SELECT id, name FROM permissions', { type: queryInterface.sequelize.QueryTypes.SELECT });
    const roles = await queryInterface.sequelize.query('SELECT id, name FROM roles', { type: queryInterface.sequelize.QueryTypes.SELECT });
    const permMap = new Map(perms.map(p => [p.name, p.id]));
    const roleMap = new Map(roles.map(r => [r.name, r.id]));

    const inserts = [];
    const adminId = roleMap.get('admin');
    const userId = roleMap.get('user');
    if (adminId) {
      for (const p of perms) inserts.push({ roleId: adminId, permissionId: p.id });
    }
    if (userId) {
      if (permMap.has('assignments:create')) inserts.push({ roleId: userId, permissionId: permMap.get('assignments:create') });
      if (permMap.has('assignments:update')) inserts.push({ roleId: userId, permissionId: permMap.get('assignments:update') });
    }
    if (inserts.length) await queryInterface.bulkInsert('role_permissions', inserts);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('role_permissions', null, {});
  }
};
