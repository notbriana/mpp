const { Sequelize } = require('sequelize');
const path = require('path');

const storage = process.env.DATABASE_URL || path.join(__dirname, '../../database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: false
});

const User = require('./user')(sequelize);
const Assignment = require('./assignment')(sequelize);
const FocusStats = require('./focusStats')(sequelize);
const FocusToday = require('./focusToday')(sequelize);
const FocusAllTime = require('./focusAllTime')(sequelize);
const UserStats = require('./userStats')(sequelize);
const Role = require('./role')(sequelize);
const Permission = require('./permission')(sequelize);
const RolePermission = require('./rolePermission')(sequelize);
const UserRole = require('./userRole')(sequelize);
const Log = require('./log')(sequelize);
const Observation = require('./observation')(sequelize);
const Session = require('./session')(sequelize);
const AssignmentCollaborator = require('./assignmentCollaborator')(sequelize);
const WebAuthnCredential = require('./webauthnCredential')(sequelize);

User.hasMany(Assignment, { foreignKey: { name: 'userId', allowNull: true }, as: 'assignments', onDelete: 'SET NULL' });
Assignment.belongsTo(User, { foreignKey: { name: 'userId', allowNull: true }, as: 'user' });

// Many-to-many: assignments <-> users (collaborators)
Assignment.belongsToMany(User, { through: AssignmentCollaborator, foreignKey: 'assignmentId', otherKey: 'userId', as: 'collaborators' });
User.belongsToMany(Assignment, { through: AssignmentCollaborator, foreignKey: 'userId', otherKey: 'assignmentId', as: 'collaborations' });

User.hasOne(FocusStats, { foreignKey: 'userId', as: 'focusStats', onDelete: 'CASCADE' });
FocusStats.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(FocusToday, { foreignKey: 'userId', as: 'focusToday', onDelete: 'CASCADE' });
FocusToday.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(FocusAllTime, { foreignKey: 'userId', as: 'focusAllTime', onDelete: 'CASCADE' });
FocusAllTime.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(UserStats, { foreignKey: 'userId', as: 'stats', onDelete: 'CASCADE' });
UserStats.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId', otherKey: 'roleId', as: 'roles' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId', otherKey: 'userId', as: 'users' });

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId', otherKey: 'permissionId', as: 'permissions' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId', otherKey: 'roleId', as: 'roles' });

User.hasMany(WebAuthnCredential, { foreignKey: { name: 'userId', allowNull: false }, as: 'webauthnCredentials', onDelete: 'CASCADE' });
WebAuthnCredential.belongsTo(User, { foreignKey: { name: 'userId', allowNull: false }, as: 'user' });

module.exports = {
  sequelize,
  User,
  AssignmentCollaborator,
  Assignment,
  FocusStats,
  FocusToday,
  FocusAllTime
  ,
  UserStats
  ,
  Role,
  Permission,
  RolePermission,
  UserRole
  ,
  Log,
  Observation
  ,
  Session,
  WebAuthnCredential
};
