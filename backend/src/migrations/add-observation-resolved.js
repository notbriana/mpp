module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('observations', 'resolved', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false });
    await queryInterface.addColumn('observations', 'resolved_at', { type: Sequelize.DATE, allowNull: true });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('observations', 'resolved_at');
    await queryInterface.removeColumn('observations', 'resolved');
  }
};
