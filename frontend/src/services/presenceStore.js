const subscribers = new Set();
const presence = {};

export function setPresence(userId, online) {
  presence[String(userId)] = !!online;
  subscribers.forEach(cb => cb(presence));
}

export function getPresence(userId) {
  return !!presence[String(userId)];
}

export function subscribe(cb) {
  subscribers.add(cb);
  cb(presence);
  return () => subscribers.delete(cb);
}

export default { setPresence, getPresence, subscribe };
