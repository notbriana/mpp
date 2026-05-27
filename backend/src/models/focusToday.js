const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FocusToday', {
    userId: { type: DataTypes.INTEGER, primaryKey: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    sessions: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    focusSecs: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
  }, {
    tableName: 'focus_today',
    timestamps: false
  });
};
