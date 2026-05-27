const { Log, Observation, sequelize } = require('../models');

const THRESHOLD = Number(process.env.DETECTOR_THRESHOLD || 3);
const WINDOW_MINUTES = Number(process.env.DETECTOR_WINDOW_MINUTES || 10);

async function scanAndFlag() {
  try {
    const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
    const rows = await sequelize.query(
      "SELECT userId, COUNT(*) as cnt FROM logs WHERE strftime('%s', created_at) >= strftime('%s', ?) GROUP BY userId",
      { replacements: [since], type: sequelize.QueryTypes.SELECT }
    );

    for (const r of rows) {
      const cnt = Number(r.cnt || 0);
      const userId = r.userId;
      if (userId && cnt >= THRESHOLD) {
        await Observation.create({
          userId,
          reason: `High activity (${cnt}) in last ${WINDOW_MINUTES}m`,
          severity: 'high'
        });
      }
    }
  } catch (err) {
    console.error('Detector error', err);
  }
}

function startDetector(intervalMs = 60 * 1000) {
  scanAndFlag();
  return setInterval(scanAndFlag, intervalMs);
}

module.exports = { scanAndFlag, startDetector };
