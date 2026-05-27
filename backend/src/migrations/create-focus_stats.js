module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('focus_stats', {
      userId: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      today: { type: Sequelize.JSON, allowNull: false },
      allTime: { type: Sequelize.JSON, allowNull: false }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('focus_stats');
  }
};
