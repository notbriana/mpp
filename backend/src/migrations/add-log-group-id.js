module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('logs', 'groupId', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'user'
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('logs', 'groupId');
  }
};
