const { verifyAccessToken, ACCESS_TOKEN_EXPIRES_SECONDS } = require('../utils/jwt');
const { findSessionByToken, updateSessionActivity } = require('../data/sessions');

const INACTIVITY_TIMEOUT_MS = Number(process.env.SESSION_INACTIVITY_MS) || (30 * 60 * 1000); 

async function attachUserContext(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  const token = auth.slice('Bearer '.length);
  const payload = verifyAccessToken(token);
  if (!payload) {
    req.user = null;
    return next();
  }

  const { userId, sessionId, iat } = payload;
  if (!userId || !sessionId) {
    req.user = null;
    return next();
  }

  const session = await findSessionByToken(sessionId).catch(() => null);
  if (!session) {
    req.user = null;
    return next();
  }

  const last = new Date(session.lastActivity).getTime();
  if (Date.now() - last > INACTIVITY_TIMEOUT_MS) {
    req.user = null;
    return next();
  }

  await updateSessionActivity(session.id).catch(() => {});
  req.user = { id: userId, sessionId: session.id, roles: payload.roles || [], permissions: payload.permissions || [] };
  return next();
}

module.exports = { attachUserContext };
