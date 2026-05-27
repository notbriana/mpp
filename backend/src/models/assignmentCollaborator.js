const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('AssignmentCollaborator', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    assignmentId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: true }
  }, {
    tableName: 'assignment_collaborators',
    timestamps: false,
    indexes: [
      { fields: ['assignmentId'] },
      { fields: ['userId'] }
    ]
  });
};
