const STORAGE_KEY = 'authUser_v1';

function getStorage() {
  try {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage || null;
  } catch (e) {
    return null;
  }
}

function loadUser() {
  try {
    const storage = getStorage();
    if (!storage) return null;
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { return null; }
}

let currentUser = loadUser();
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn(currentUser));
}

export const authStore = {
  getUser() {
    return currentUser;
  },
  setUser(user) {
    currentUser = user;
    try {
      const storage = getStorage();
      if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch(e) {}
    notify();
  },
  clear() {
    currentUser = null;
    try {
      const storage = getStorage();
      if (storage) storage.removeItem(STORAGE_KEY);
    } catch(e) {}
    notify();
  },
  subscribe(fn) {
    listeners.add(fn);
    fn(currentUser);
    return () => listeners.delete(fn);
  }
};

export function getAuthUser() {
  return currentUser;
}

export function isAdmin() {
  const u = getAuthUser();
  if (!u) return false;
  if (u.email === 'admin@example.com') return true;
  if (u.roles && Array.isArray(u.roles)) return u.roles.includes('admin');
  return false;
}
