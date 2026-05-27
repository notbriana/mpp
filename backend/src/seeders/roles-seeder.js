module.exports = {
  async up(queryInterface) {
    const items = [
      { name: 'admin', description: 'Administrator with full permissions' },
      { name: 'user', description: 'Regular user with limited permissions' }
    ];
    await queryInterface.bulkInsert('roles', items);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', { name: ['admin','user'] });
  }
};
