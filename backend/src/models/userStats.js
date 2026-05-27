const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('UserStats', {
    userId: { type: DataTypes.INTEGER, primaryKey: true },
    total: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    not_started: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    in_progress: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    completed: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    overdue: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
  }, {
    tableName: 'user_stats',
    timestamps: false
  });
};
