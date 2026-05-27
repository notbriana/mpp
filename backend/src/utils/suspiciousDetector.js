const WINDOW_MS = 10 * 1000;
const RATE_THRESHOLD = Number(process.env.SUSPICIOUS_RATE_THRESHOLD) || 200;
const MAX_ENTRIES = 10000;

const { scoreFeatures } = require('../services/aiDetectorClient');
const { pushAlert } = require('./alertsBroadcaster');

const buckets = new Map();

function now() { return Date.now(); }

async function maybeAnalyze(key, arr, info) {
  try {
    if (!scoreFeatures) return null;
    if (!arr || arr.length < 8) return null; // avoid noisy calls
    const inters = [];
    for (let i = 1; i < arr.length; i++) inters.push(arr[i].t - arr[i-1].t);
    const avgIat = inters.length ? (inters.reduce((a,b)=>a+b,0)/inters.length) : 0;
    const uniquePaths = new Set(arr.map(x=>x.info && x.info.path).filter(Boolean)).size;
    const postCount = arr.filter(x => x.info && x.info.method === 'POST').length;
    const failedAuth = arr.filter(x => x.info && x.info.status >= 400).length;
    const features = {
      reqCount: arr.length,
      avgIatMs: Math.round(avgIat),
      failedAuth,
      uniquePaths,
      postRatio: postCount / Math.max(1, arr.length)
    };
    const res = await scoreFeatures(key, features).catch(e => null);
    if (res && (res.is_anomaly || (res.score && res.score > 0.7))) {
      const alert = { key, features, score: res.score || 1, reason: 'ai_anomaly', ts: now() };
      pushAlert(alert);
      console.warn('[suspiciousDetector] AI ALERT', alert);
      return alert;
    }
  } catch (e) {
    console.error('AI analysis failed', e);
  }
  return null;
}

function record(key, info = {}) {
  if (!key) return null;
  let arr = buckets.get(key);
  if (!arr) {
    if (buckets.size > MAX_ENTRIES) {
      const it = buckets.keys();
      const first = it.next().value;
      buckets.delete(first);
    }
    arr = [];
    buckets.set(key, arr);
  }
  const t = now();
  arr.push({ t, info });
  while (arr.length && (t - arr[0].t) > WINDOW_MS) arr.shift();

  if (arr.length >= RATE_THRESHOLD) {
    const message = `High request rate detected for ${key}: ${arr.length} reqs/${WINDOW_MS}ms`;
    const alert = { key, message, ts: t, count: arr.length, info };
    pushAlert(alert);
    console.warn('[suspiciousDetector] ALERT', alert);
    return alert;
  }

  // async AI analysis (best-effort)
  maybeAnalyze(key, arr, info).catch(() => {});
  return null;
}

function getAlerts(sinceTs = 0) {
  // delegate to broadcaster in routes; keep a lightweight view in-memory if needed
  return [];
}

function reset() {
  buckets.clear();
}

module.exports = { record, getAlerts, reset, WINDOW_MS, RATE_THRESHOLD };
