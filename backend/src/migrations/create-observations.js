module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('observations', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      reason: { type: Sequelize.STRING, allowNull: false },
      severity: { type: Sequelize.STRING, allowNull: false, defaultValue: 'medium' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('observations');
  }
};
