const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const Session = sequelize.define('Session', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => uuidv4()
    },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    refreshToken: { type: DataTypes.STRING, allowNull: false },
    lastActivity: { type: DataTypes.DATE, allowNull: false, defaultValue: () => new Date() },
    mfaPending: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    mfaMethod: { type: DataTypes.STRING, allowNull: true },
    mfaTempCode: { type: DataTypes.STRING, allowNull: true },
    mfaTempExpires: { type: DataTypes.DATE, allowNull: true },
    mfaSecret: { type: DataTypes.STRING, allowNull: true }
  }, {
    tableName: 'sessions',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false
  });

  return Session;
};
