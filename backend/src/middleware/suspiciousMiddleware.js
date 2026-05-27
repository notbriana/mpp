const { record } = require('../utils/suspiciousDetector');

function suspiciousMiddleware(req, res, next) {
  try {
    const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    const sessionId = (req.user && req.user.sessionId) ? `sess:${req.user.sessionId}` : null;
    const key = sessionId || ip;
    // record request (do not block here, just monitor)
    record(key, { path: req.path, method: req.method });

    // also monitor on response finish for status-based heuristics in the future
    res.on('finish', () => {
      // could extend to record failed auth, error rates, etc.
    });
  } catch (e) {
    // swallow
  }
  return next();
}

module.exports = { suspiciousMiddleware };
