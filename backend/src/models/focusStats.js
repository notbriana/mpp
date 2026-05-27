const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FocusStats', {
    userId: { type: DataTypes.INTEGER, primaryKey: true },
    today: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    allTime: { type: DataTypes.JSON, allowNull: false, defaultValue: {} }
  }, {
    tableName: 'focus_stats',
    timestamps: false
  });
};
