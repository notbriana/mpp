import { networkStatus } from './networkStatus';
import { getAuthUser } from '../store/authStore';

function getDefaultApiBaseUrl() {
  try {
    const wsEnv = import.meta.env.VITE_WS_URL;
    if (wsEnv) {
      const parsed = new URL(wsEnv);
      const protocol = parsed.protocol === 'wss:' ? 'https:' : 'http:';
      return `${protocol}//${parsed.hostname}:${parsed.port || '3001'}`;
    }
    const origin = window.location.origin;
    const parsed = new URL(origin);
    const protocol = parsed.protocol === 'https:' ? 'https:' : 'http:';
    const host = parsed.hostname;
    const port = parsed.port && parsed.port !== '5173' ? parsed.port : '3001';
    return `${protocol}//${host}:${port}`;
  } catch (e) {
    return 'http://localhost:3001';
  }
}

let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || getDefaultApiBaseUrl();

// DEV: If the frontend is served over plain HTTP (dev), avoid accidentally using HTTPS for local API calls.
// This prevents the browser from trying `https://<LAN_IP>:3001` when the backend is only HTTP.
if (typeof window !== 'undefined') {
  try {
    const pageProto = window.location && window.location.protocol ? window.location.protocol : 'http:';
    if (pageProto === 'http:' && API_BASE_URL.startsWith('https:')) {
      API_BASE_URL = API_BASE_URL.replace('https:', 'http:');
    }
    window.__API_BASE_URL = API_BASE_URL;
  } catch (e) { /* ignore */ }
}

export async function gqlRequest(query, variables = {}) {
  try {
    const user = getAuthUser();
    const headers = { 'Content-Type': 'application/json' };
    if (user?.accessToken) headers['Authorization'] = `Bearer ${user.accessToken}`;
    else if (user?.id) headers['x-user-id'] = String(user.id);
    const response = await fetch(`${API_BASE_URL}/graphql`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables })
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok || payload.errors) {
      const error = new Error(payload?.errors?.[0]?.message || 'GraphQL request failed');
      error.payload = payload;
      error.status = response.status;
      throw error;
    }

    networkStatus.setOnline(true);
    return payload.data;
  } catch (error) {
    const isOffline = typeof navigator !== 'undefined' && navigator && !navigator.onLine;
    const status = typeof error.status === 'number' ? error.status : null;
    if (error instanceof TypeError || isOffline || status === 0 || (status && status >= 500)) {
      networkStatus.setOnline(false);
    }
    throw error;
  }
}
