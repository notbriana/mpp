module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_roles', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      roleId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'roles', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' }
    });
    await queryInterface.addConstraint('user_roles', {
      type: 'unique',
      fields: ['userId','roleId'],
      name: 'uniq_user_role'
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('user_roles');
  }
};
