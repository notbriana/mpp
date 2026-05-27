const express = require('express');
const router = express.Router();
const { getAlerts, sseHandler, pushAlert } = require('../utils/alertsBroadcaster');

router.get('/', (req, res) => {
  const since = Number(req.query.since) || 0;
  res.json({ alerts: getAlerts(since) });
});

// SSE stream for real-time alerts
router.get('/stream', (req, res) => sseHandler(req, res));

module.exports = router;
