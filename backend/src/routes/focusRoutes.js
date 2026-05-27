const express = require('express');
const { getFocusStats, setFocusStats } = require('../data/store');
const { logAction } = require('../data/logging');

const router = express.Router();

router.get('/stats', async (req, res) => {
  const userId = Number(req.query.userId);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: 'userId is required.' });
  }
  res.json(await getFocusStats(userId));
});

router.post('/stats', async (req, res) => {
  const userId = Number(req.body?.userId);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: 'userId is required.' });
  }
  const payload = req.body || {};
  if (!payload.today || !payload.allTime) {
    return res.status(400).json({ message: 'Invalid focus stats payload.' });
  }
  const updated = await setFocusStats(userId, payload);
  await logAction({
    userId,
    action: 'focus:update',
    actionInfo: 'Focus stats updated (REST)',
    meta: { today: payload.today, source: 'rest' }
  });
  return res.json(updated);
});

module.exports = router;
