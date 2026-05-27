const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FocusAllTime', {
    userId: { type: DataTypes.INTEGER, primaryKey: true },
    totalSecs: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    streak: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    lastActiveDate: { type: DataTypes.DATEONLY, allowNull: true }
  }, {
    tableName: 'focus_alltime',
    timestamps: false
  });
};
