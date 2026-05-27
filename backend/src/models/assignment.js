const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Assignment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    course_name: { type: DataTypes.STRING, allowNull: true },
    due_date: { type: DataTypes.DATEONLY, allowNull: true },
    priority: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATEONLY, allowNull: true }
  }, {
    tableName: 'assignments',
    timestamps: false
  });
};
