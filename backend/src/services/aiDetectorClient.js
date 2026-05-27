const AI_URL = process.env.AI_DETECTOR_URL || 'http://127.0.0.1:5000/predict';

const { scoreFromFeatures } = require('./localAIDetector');

async function getFetch() {
  if (typeof fetch !== 'undefined') return fetch;
  try {
    const mod = await import('node-fetch');
    return mod.default;
  } catch (e) {
    return null; // we'll fallback to local detector
  }
}

async function scoreFeatures(key, features) {
  try {
    const f = await getFetch();
    const res = await f(AI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip: key, features, ts: Date.now() }),
    });
    if (!res || !res.ok) throw new Error(`AI service returned ${res && res.status}`);
    const j = await res.json();
    return j;
  } catch (err) {
    console.warn('[aiDetectorClient] failed to score features', err && err.message);
    // fallback to local heuristic
    try {
      const local = scoreFromFeatures(features);
      return local;
    } catch (e) {
      return null;
    }
  }
}

module.exports = { scoreFeatures };
