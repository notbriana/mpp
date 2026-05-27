const { Session } = require('../models');
const { v4: uuidv4 } = require('uuid');

async function createSession(userId, opts = {}) {
  const refreshToken = uuidv4();
  const payload = Object.assign({ userId, refreshToken, lastActivity: new Date() }, opts);
  const s = await Session.create(payload);
  return s;
}

async function findSessionByToken(token) {
  if (!token) return null;
  return await Session.findOne({ where: { refreshToken: token } });
}

async function updateSessionActivity(id) {
  const s = await Session.findByPk(id);
  if (!s) return null;
  s.lastActivity = new Date();
  await s.save();
  return s;
}

async function invalidateSession(id) {
  const s = await Session.findByPk(id);
  if (!s) return false;
  await s.destroy();
  return true;
}

module.exports = { createSession, findSessionByToken, updateSessionActivity, invalidateSession };
