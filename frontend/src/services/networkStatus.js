let online = typeof navigator !== 'undefined' ? navigator.onLine : true;
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn(online));
}

function setOnline(value) {
  if (online === value) return;
  online = value;
  notify();
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => setOnline(true));
  window.addEventListener('offline', () => setOnline(false));
}

export const networkStatus = {
  isOnline() {
    return online;
  },
  setOnline,
  subscribe(fn) {
    listeners.add(fn);
    fn(online);
    return () => listeners.delete(fn);
  }
};
