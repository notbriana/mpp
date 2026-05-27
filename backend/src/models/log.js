const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Log', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    groupId: { type: DataTypes.STRING, allowNull: false, defaultValue: 'user' },
    action: { type: DataTypes.STRING, allowNull: false },
    details: { type: DataTypes.JSON, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'logs',
    timestamps: false
  });
};
