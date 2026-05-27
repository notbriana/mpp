const subs = new Set();
const counts = {};

export function incUnread(userId) {
  const k = String(userId);
  counts[k] = (counts[k] || 0) + 1;
  subs.forEach(s => s(counts));
}

export function resetUnread(userId) {
  const k = String(userId);
  if (counts[k]) { delete counts[k]; subs.forEach(s => s(counts)); }
}

export function getUnread(userId) { return counts[String(userId)] || 0; }

export function subscribe(cb) { subs.add(cb); cb(counts); return () => subs.delete(cb); }

export default { incUnread, resetUnread, getUnread, subscribe };
