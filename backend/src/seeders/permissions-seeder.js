module.exports = {
  async up(queryInterface) {
    const items = [
      { name: 'assignments:create', description: 'Create assignments' },
      { name: 'assignments:update', description: 'Update assignments' },
      { name: 'assignments:delete', description: 'Delete assignments' },
      { name: 'users:manage', description: 'Manage users' },
      { name: 'roles:manage', description: 'Manage roles and permissions' }
    ];
    await queryInterface.bulkInsert('permissions', items);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('permissions', null, {});
  }
};
