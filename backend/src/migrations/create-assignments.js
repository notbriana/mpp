module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('assignments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: Sequelize.STRING, allowNull: false },
      course_name: { type: Sequelize.STRING, allowNull: true },
      due_date: { type: Sequelize.DATEONLY, allowNull: true },
      priority: { type: Sequelize.STRING, allowNull: true },
      status: { type: Sequelize.STRING, allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATEONLY, allowNull: true },
      userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('assignments');
  }
};
