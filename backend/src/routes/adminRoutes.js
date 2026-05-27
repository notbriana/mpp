const express = require('express');
const router = express.Router();
const { listChats, getConversation } = require('../chat/chatStore');
const { Log, Observation, User } = require('../models');

async function isAdminUser(userId) {
  const uid = Number(userId);
  if (!uid) return false;
  const user = await User.findByPk(uid);
  if (!user) return false;
  const roles = await user.getRoles().catch(() => []);
  return roles.some(r => r.name === 'admin');
}

async function requireAdmin(req, res, next) {
  try {
    const userId = req.query.userId || req.header('x-user-id');
    if (!userId) return res.status(403).json({ error: 'admin required' });
    const ok = await isAdminUser(userId);
    if (!ok) {
      // fallback: allow if the user id exists and has the special admin email
      try {
        const u = await User.findByPk(Number(userId));
        if (u && String(u.email).toLowerCase() === 'admin@example.com') {
          console.debug('requireAdmin: allowed by admin@example.com fallback for userId=', userId);
          return next();
        }
      } catch (e) {
        // ignore lookup errors
      }
      console.debug('requireAdmin: denied userId=', userId, 'isAdmin=', ok);
      return res.status(403).json({ error: 'admin required' });
    }
    return next();
  } catch (e) {
    return res.status(500).json({ error: 'admin check failed' });
  }
}

router.get('/logs', requireAdmin, async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 200, 1000);
    const logs = await Log.findAll({ order: [['created_at', 'DESC']], limit });
    res.json(logs);
  } catch (err) { next(err); }
});

router.get('/observations', requireAdmin, async (req, res, next) => {
  try {
    const obs = await Observation.findAll({ order: [['created_at', 'DESC']] });
    res.json(obs);
  } catch (err) { next(err); }
});

router.post('/observations/:id/clear', requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await Observation.destroy({ where: { id } });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.get('/chats', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 200, 2000);
    const messages = await listChats(limit);
    res.json({ messages });
  } catch (err) { res.status(500).json({ error: 'failed' }); }
});

// conversation scoped to the logged-in user (header Authorization: Bearer <userId> or x-user-id)
router.get('/conversation/:otherUserId', async (req, res) => {
  try {
    const other = String(req.params.otherUserId || '');
    const auth = req.header('authorization') || '';
    let userId = req.query.userId || req.header('x-user-id') || null;
    if (!userId && auth && auth.startsWith('Bearer ')) userId = auth.slice(7).trim();
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const messages = await getConversation(userId, other);
    res.json({ messages });
  } catch (err) { res.status(500).json({ error: 'failed' }); }
});

module.exports = router;
