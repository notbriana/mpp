const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Observation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    reason: { type: DataTypes.STRING, allowNull: false },
    severity: { type: DataTypes.STRING, allowNull: false, defaultValue: 'medium' },
    resolved: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    resolved_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'observations',
    timestamps: false
  });
};
