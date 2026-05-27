const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('WebAuthnCredential', {
    id: { type: DataTypes.STRING, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    credentialId: { type: DataTypes.STRING, allowNull: false, unique: true },
    publicKey: { type: DataTypes.TEXT, allowNull: false },
    counter: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    transports: { type: DataTypes.TEXT, allowNull: true },
    deviceType: { type: DataTypes.STRING, allowNull: true },
    backedUp: { type: DataTypes.BOOLEAN, allowNull: true }
  }, {
    tableName: 'webauthn_credentials',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });
};
