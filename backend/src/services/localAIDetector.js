function clamp(v, a=0, b=1) { return Math.max(a, Math.min(b, v)); }

function scoreFromFeatures(features = {}) {
  const reqCount = Number(features.reqCount || 0);
  const avgIatMs = Number(features.avgIatMs || 1000);
  const failedAuth = Number(features.failedAuth || 0);
  const uniquePaths = Number(features.uniquePaths || 1);
  const postRatio = Number(features.postRatio || 0);

  // Heuristic weights (sum to 1)
  const wReq = 0.4; // many requests
  const wIat = 0.2; // very small inter-arrival
  const wFail = 0.2; // failed auths
  const wPaths = 0.1; // many unique endpoints
  const wPost = 0.1; // many POSTs

  const sReq = clamp((reqCount - 5) / 100); // maps 5..105 -> 0..1
  const sIat = clamp((500 - avgIatMs) / 500); // avgIatMs <500 => >0
  const sFail = clamp(failedAuth / 10);
  const sPaths = clamp((uniquePaths - 1) / 20);
  const sPost = clamp(postRatio);

  let score = wReq*sReq + wIat*sIat + wFail*sFail + wPaths*sPaths + wPost*sPost;
  // boost score for extreme cases
  if (reqCount > 500) score = Math.max(score, 0.95);
  if (failedAuth > 20) score = Math.max(score, 0.9);

  const is_anomaly = score > 0.65;
  return { score: Number(score.toFixed(3)), is_anomaly };
}

module.exports = { scoreFromFeatures };
