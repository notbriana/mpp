const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('UserRole', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    roleId: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    tableName: 'user_roles',
    timestamps: false
  });
};
