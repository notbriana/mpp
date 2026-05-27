module.exports = {
  async up(queryInterface) {
    const now = new Date().toISOString();
    await queryInterface.bulkInsert('users', [
      { name: 'Test User A', email: 'usera@example.com', password: 'password123' },
      { name: 'Test User B', email: 'userb@example.com', password: 'password123' }
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: ['usera@example.com', 'userb@example.com'] });
  }
};
