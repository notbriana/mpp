module.exports = {
  async up(queryInterface) {
    const users = await queryInterface.sequelize.query("SELECT id, email FROM users WHERE email IN ('usera@example.com','userb@example.com')", { type: queryInterface.sequelize.QueryTypes.SELECT });
    const map = {};
    users.forEach(u => { map[u.email] = u.id; });

    const items = [
      { title: 'Seeded Assignment 1', course_name: 'CS 101', due_date: '2026-05-01', priority: 'High', status: 'Not Started', description: 'Seeded', created_at: '2026-04-01', userId: map['usera@example.com'] },
      { title: 'Seeded Assignment 2', course_name: 'MATH 200', due_date: '2026-04-01', priority: 'Low', status: 'Completed', description: 'Seeded', created_at: '2026-04-01', userId: map['userb@example.com'] }
    ].filter(i => i.userId);

    if (items.length) await queryInterface.bulkInsert('assignments', items);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('assignments', { title: ['Seeded Assignment 1', 'Seeded Assignment 2'] });
  }
};
