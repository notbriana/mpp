const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Permission', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'permissions',
    timestamps: false
  });
};
