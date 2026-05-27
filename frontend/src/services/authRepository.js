import { gqlRequest } from './graphqlClient';
import { authStore } from '../store/authStore';
import { CookieMonitor } from '../cookies/cookieMonitor';

// API base for direct REST calls (safe for browser + Vite)
const API_BASE = (typeof process !== 'undefined' && process.env && process.env.API_BASE_URL)
  || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
  || 'http://localhost:3001';

const STORAGE_KEY = 'localUsers_v1';

function createInMemoryStore() {
  const store = { data: {} };
  return {
    getItem(key) { return store.data[key]; },
    setItem(key, value) { store.data[key] = value; }
  };
}

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  return createInMemoryStore();
}

const storage = getStorage();

function getLocalUsers() {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) { return []; }
}

function saveLocalUsers(users) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(users)); } catch (e) {}
}

function addLocalUser({ name, email, password }) {
  const users = getLocalUsers();
  const exists = users.find((u) => u.email === email);
  if (exists) return exists;
  const user = { id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`, name, email, password };
  users.push(user);
  saveLocalUsers(users);
  return user;
}

const REGISTER_MUTATION = `
  mutation Register($name: String!, $email: String!, $password: String!, $confirmPassword: String!) {
    register(name: $name, email: $email, password: $password, confirmPassword: $confirmPassword) {
      user { id name email roles }
      errors { field message }
      accessToken
      refreshToken
      mfaPending
      mfaMethods
      totpSetupUri
    }
  }
`;

const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user { id name email roles }
      errors { field message }
      accessToken
      refreshToken
      mfaPending
      mfaMethods
      totpSetupUri
    }
  }
`;
const CHANGE_PASSWORD_MUTATION = `
  mutation ChangePassword($email: String!, $currentPassword: String!, $newPassword: String!, $confirmPassword: String!) {
    changePassword(email: $email, currentPassword: $currentPassword, newPassword: $newPassword, confirmPassword: $confirmPassword) {
      user { id name email }
      errors { field message }
    }
  }
`;

function toErrorMap(errors) {
  return errors.reduce((acc, err) => {
    acc[err.field] = err.message;
    return acc;
  }, {});
}

export async function registerUser(payload) {
  try {
    const data = await gqlRequest(REGISTER_MUTATION, payload);
    const result = data.register;
    // if tokens returned, store them
    if (result.accessToken) {
      authStore.setUser({ ...result.user, accessToken: result.accessToken, refreshToken: result.refreshToken });
    }
    if (result.mfaPending && result.user) {
      authStore.setUser({ ...result.user, refreshToken: result.refreshToken, mfaMethods: result.mfaMethods, totpSetupUri: result.totpSetupUri });
    }
    // support MFA pending flows: GraphQL may return mfaPending + refreshToken
    return {
      user: result.user,
      errors: toErrorMap(result.errors),
      formError: '',
      mfaPending: result.mfaPending,
      refreshToken: result.refreshToken,
      mfaMethods: result.mfaMethods,
      totpSetupUri: result.totpSetupUri
    };
  } catch (err) {
    // offline: create local user
    const user = addLocalUser(payload);
    return { user: { id: user.id, name: user.name, email: user.email }, errors: {}, formError: '' };
  }
}

export async function loginUser(payload) {
  try {
    const data = await gqlRequest(LOGIN_MUTATION, payload);
    const result = data.login;
    if (result.accessToken) {
      authStore.setUser({ ...result.user, accessToken: result.accessToken, refreshToken: result.refreshToken });
    }
    if (result.mfaPending && result.user) {
      authStore.setUser({ ...result.user, refreshToken: result.refreshToken, mfaMethods: result.mfaMethods, totpSetupUri: result.totpSetupUri });
    }
    return {
      user: result.user,
      errors: toErrorMap(result.errors),
      formError: '',
      mfaPending: result.mfaPending,
      refreshToken: result.refreshToken,
      accessToken: result.accessToken,
      mfaMethods: result.mfaMethods,
      totpSetupUri: result.totpSetupUri
    };
  } catch (err) {
    // network/offline fallback: try local users
    const users = getLocalUsers();
    const found = users.find((u) => u.email === payload.email && u.password === payload.password);
    if (found) return { user: { id: found.id, name: found.name, email: found.email }, errors: {}, formError: '' };
    throw err;
  }
}

export async function changePassword(payload) {
  const data = await gqlRequest(CHANGE_PASSWORD_MUTATION, payload);
  const result = data.changePassword;
  return { user: result.user, errors: toErrorMap(result.errors), formError: '' };
}

export async function requestPasswordReset(email) {
  const res = await fetch(`${API_BASE}/api/auth/password/forgot`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
  });
  return res.ok;
}

export async function resetPassword(token, password) {
  const res = await fetch(`${API_BASE}/api/auth/password/reset`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password })
  });
  return res.ok;
}

export async function verifyMfa(refreshToken, code, totp) {
  const res = await fetch(`${API_BASE}/api/auth/mfa/verify`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken, code, totp })
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'mfa_failed');
  }
  const body = await res.json();
  if (body.accessToken) {
    // store access token on authStore
    const user = authStore.getUser() || {};
    authStore.setUser({ ...user, accessToken: body.accessToken });
  }
  return body;
}

export async function logout() {
  const user = authStore.getUser();
  const refreshToken = user?.refreshToken;
  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
  } catch (e) {
    // ignore network errors
  }
  try { CookieMonitor.trackLogout(); CookieMonitor.clearAll(); } catch (e) {}
  try { authStore.clear(); } catch (e) {}
}
