const WINDOW_DEFAULT = 10 * 60 * 1000;
const alerts = [];
const sseClients = new Set();

function now() { return Date.now(); }

function pushAlert(alert) {
  if (!alert.ts) alert.ts = now();
  alerts.push(alert);
  const payload = `data: ${JSON.stringify(alert)}\n\n`;
  for (const res of Array.from(sseClients)) {
    try { res.write(payload); } catch (e) { sseClients.delete(res); }
  }
}

function getAlerts(since = 0) {
  const cut = Number(since) || (now() - WINDOW_DEFAULT);
  return alerts.filter(a => a.ts >= cut);
}

function sseHandler(req, res) {
  res.writeHead(200, {
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
  });
  res.write('\n');
  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
}

module.exports = { pushAlert, getAlerts, sseHandler };
