import { getAuthUser } from '../store/authStore';
import presenceStore from './presenceStore';
import unreadStore from './unreadStore';

function getDefaultWsUrl() {
  const wsEnv = import.meta.env.VITE_WS_URL;
  if (wsEnv) return wsEnv;
  const apiEnv = import.meta.env.VITE_API_BASE_URL;
  if (apiEnv) {
    try {
      const parsed = new URL(apiEnv);
      const protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${parsed.hostname}:${parsed.port || '3001'}`;
    } catch (e) {  }
  }
  try {
    const origin = window.location.origin;
    const parsed = new URL(origin);
    const protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = parsed.hostname;
    const port = parsed.port && parsed.port !== '5173' ? parsed.port : '3001';
    return `${protocol}//${host}:${port}`;
  } catch (e) {
    return 'ws://localhost:3001';
  }
}

let socket = null;
let handlers = [];
let queued = [];
let currentUserId = null;
let connectionState = 'disconnected';
const connectionSubscribers = new Set();

function setConnectionState(state) {
  connectionState = state;
  connectionSubscribers.forEach((cb) => cb(state));
}

function createSocket(url, userId) {
  socket = new WebSocket(url.replace(/\/$/, ''));
  currentUserId = userId ? String(userId) : null;
  setConnectionState('connecting');

  socket.addEventListener('open', () => {
    if (currentUserId) socket.send(JSON.stringify({ type: 'auth', userId: currentUserId }));
    setConnectionState('connected');
    queued.forEach(p => {
      try { socket.send(JSON.stringify(p)); } catch (e) { console.error('ws send queued', e); }
    });
    queued = [];
  });

  socket.addEventListener('message', (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      if (msg.type === 'presence' && msg.payload) {
        presenceStore.setPresence(String(msg.payload.userId), !!msg.payload.online);
      }
      if (msg.type === 'chat:message' && msg.payload) {
        const me = getAuthUser();
        const p = msg.payload;
        if (String(p.to) === String(me?.id) && String(p.from) !== String(me?.id)) {
          unreadStore.incUnread(p.from);
        }
      }

      handlers.forEach(h => h(msg));
    } catch (e) { console.error('ws parse', e); }
  });

  socket.addEventListener('close', () => { socket = null; setConnectionState('disconnected'); });
  socket.addEventListener('error', () => { setConnectionState('disconnected'); });
  return socket;
}

export function connectSocket(userId) {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    if (userId && String(userId) !== currentUserId) {
      currentUserId = String(userId);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'auth', userId: currentUserId }));
      }
    }
    return socket;
  }
  const url = getDefaultWsUrl();
  return createSocket(url, userId);
}

export function onMessage(cb) { handlers.push(cb); return () => { handlers = handlers.filter(h => h !== cb); }; }

export function subscribeConnection(cb) {
  connectionSubscribers.add(cb);
  cb(connectionState);
  return () => connectionSubscribers.delete(cb);
}

export function sendChatMessage({ to, room, text, clientId } = {}) {
  const user = getAuthUser();
  const payload = { type: 'chat:message', payload: { from: user?.id, to: to != null ? String(to) : null, room, text, clientId } };
  try {
    if (socket && socket.readyState === WebSocket.OPEN) {
      if (user?.id && String(user.id) !== currentUserId) {
        currentUserId = String(user.id);
        socket.send(JSON.stringify({ type: 'auth', userId: currentUserId }));
      }
      socket.send(JSON.stringify(payload));
    } else {
      connectSocket(user?.id);
      queued.push(payload);
    }
  } catch (e) {
    console.error('sendChatMessage error', e);
  }
}

export function closeSocket() { if (socket) socket.close(); socket = null; handlers = []; queued = []; }
