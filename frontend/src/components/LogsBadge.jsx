import React, { useEffect, useState } from 'react';
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

const API_BASE = import.meta.env.VITE_API_BASE_URL || getDefaultApiBaseUrl();

export default function LogsBadge() {
  const [count, setCount] = useState(0);

  async function load() {
    try {
      const me = getAuthUser();
      if (!me?.id) return;
      const res = await fetch(`${API_BASE}/api/admin/logs?limit=50&userId=${me.id}`);
      if (!res.ok) return;
      const arr = await res.json();
      setCount(Array.isArray(arr) ? arr.length : 0);
    } catch (e) {  }
  }

  useEffect(() => {
    load();
    const iv = setInterval(load, 10000);
    return () => clearInterval(iv);
  }, []);

  return (
    <button className="btn-outline" onClick={() => window.location.href = '/admin/logs'} style={{ position: 'relative' }}>
      Logs
      {count > 0 && (
        <span style={{ position: 'absolute', top: 6, right: 6, background: 'var(--accent)', color: '#fff', borderRadius: 10, padding: '2px 6px', fontSize: 12 }}>
          {count}
        </span>
      )}
    </button>
  );
}
