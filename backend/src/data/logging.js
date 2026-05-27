const { Log, User } = require('../models');

async function resolveGroupId(userId) {
  if (!userId) return 'user';
  try {
    const u = await User.findByPk(userId);
    if (!u) return 'user';
    const roles = await u.getRoles().catch(() => []);
    return roles.some(r => r.name === 'admin') ? 'admin' : 'user';
  } catch (e) {
    return 'user';
  }
}

async function logAction({ userId, groupId, action, actionInfo, meta }) {
  if (!action) return null;
  const gid = groupId || await resolveGroupId(userId);
  const details = {
    actionInfo: actionInfo || action,
    actorRole: gid,
    ...(meta || {})
  };

  try {
    return await Log.create({
      userId: userId ? Number(userId) : null,
      groupId: gid,
      action,
      details
    });
  } catch (e) {
    return null;
  }
}

module.exports = { logAction, resolveGroupId };
