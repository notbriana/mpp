module.exports = {
  async up(queryInterface) {
    const users = await queryInterface.sequelize.query("SELECT id, email FROM users WHERE email IN ('usera@example.com','userb@example.com')", { type: queryInterface.sequelize.QueryTypes.SELECT });
    const roles = await queryInterface.sequelize.query('SELECT id, name FROM roles', { type: queryInterface.sequelize.QueryTypes.SELECT });
    const roleMap = new Map(roles.map(r => [r.name, r.id]));
    const inserts = [];
    const adminId = roleMap.get('admin');
    for (const u of users) {
      if (u.email === 'usera@example.com' && adminId) inserts.push({ userId: u.id, roleId: adminId });
    }
    if (inserts.length) await queryInterface.bulkInsert('user_roles', inserts);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('user_roles', null, {});
  }
};
