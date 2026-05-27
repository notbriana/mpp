const jwt = require('jsonwebtoken');
const { User } = require('../models');

const AUTH_SECRET = process.env.AUTH_SECRET || 'brianalol';
const ACCESS_TOKEN_EXPIRES_SECONDS = Number(process.env.ACCESS_TOKEN_EXPIRES_SECONDS) || 15 * 60; 

async function signAccessToken(payload) {
  try {
    if (payload && payload.userId) {
      const u = await User.findByPk(payload.userId);
      if (u) {
        const roles = (await u.getRoles().catch(() => [])).map(r => r.name);
        const perms = [];
        const roleObjs = await u.getRoles().catch(() => []);
        for (const r of roleObjs) {
          const p = await r.getPermissions().catch(() => []);
          p.forEach(x => perms.push(x.name));
        }
        payload.roles = roles;
        payload.permissions = Array.from(new Set(perms));
      }
    }
  } catch (e) {
  }
  return jwt.sign(payload, AUTH_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_SECONDS });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, AUTH_SECRET);
  } catch (e) {
    return null;
  }
}

module.exports = { signAccessToken, verifyAccessToken, ACCESS_TOKEN_EXPIRES_SECONDS };
