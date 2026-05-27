module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('role_permissions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      roleId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'roles', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      permissionId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'permissions', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' }
    });
    await queryInterface.addConstraint('role_permissions', {
      type: 'unique',
      fields: ['roleId','permissionId'],
      name: 'uniq_role_permission'
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('role_permissions');
  }
};
