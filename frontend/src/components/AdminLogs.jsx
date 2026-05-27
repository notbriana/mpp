import React, { useEffect, useState } from 'react';
import { getAuthUser } from '../store/authStore';

function resolveApiBase() {
  const apiEnv = import.meta.env.VITE_API_BASE_URL;
  if (apiEnv) return apiEnv.replace(/\/$/, '');
  try {
    const parsed = new URL(window.location.origin);
    const port = parsed.port && parsed.port !== '5173' ? parsed.port : '3001';
    return `${parsed.protocol}//${parsed.hostname}:${port}`;
  } catch (e) {
    return 'http://localhost:3001';
  }
}

const API_BASE = resolveApiBase();

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const user = getAuthUser();
  const adminId = user?.id;

  async function fetchAll() {
    if (!adminId) return setError('Not authenticated');
    setLoading(true);
    setError(null);
    try {
      const h = { 'x-user-id': String(adminId) };
      const [logsRes, obsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/logs?limit=200`, { headers: h }),
        fetch(`${API_BASE}/api/admin/observations`, { headers: h })
      ]);
      if (!logsRes.ok) {
        let body = '';
        try { body = await logsRes.text(); } catch (e) {}
        throw new Error(`logs fetch failed: ${logsRes.status} ${body}`);
      }
      if (!obsRes.ok) {
        let body = '';
        try { body = await obsRes.text(); } catch (e) {}
        throw new Error(`observations fetch failed: ${obsRes.status} ${body}`);
      }
      const logsJson = await logsRes.json();
      const obsJson = await obsRes.json();
      setLogs(Array.isArray(logsJson) ? logsJson : []);
      setObservations(Array.isArray(obsJson) ? obsJson : []);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, [adminId]);

  return (
    <div style={{ padding: 12 }}>
      <h2>Admin — Logs & Observations</h2>
      {!adminId && <div>Please sign in as an admin to view logs.</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      <div style={{ margin: '8px 0' }}>
        <button onClick={fetchAll} disabled={loading || !adminId}>{loading ? 'Loading…' : 'Refresh'}</button>
      </div>

      <section>
        <h3>Recent Logs</h3>
        <div style={{ maxHeight: 300, overflow: 'auto', border: '1px solid #ddd', padding: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>id</th>
                <th>userId</th>
                <th>group</th>
                <th>action</th>
                <th>details</th>
                <th>at</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} style={{ borderTop: '1px solid #eee' }}>
                  <td>{l.id}</td>
                  <td>{l.userId}</td>
                  <td>{l.groupId}</td>
                  <td>{l.action}</td>
                  <td style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{typeof l.details === 'string' ? l.details : JSON.stringify(l.details)}</td>
                  <td>{new Date(l.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: 12 }}>
        <h3>Observations</h3>
        <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid #eee', padding: 8 }}>
          {observations.length === 0 && <div>No observations</div>}
          <ul>
            {observations.map(o => (
              <li key={o.id} style={{ marginBottom: 6 }}>
                <strong>{o.severity}</strong> — user {o.userId}: {o.reason} {o.resolved ? '(resolved)' : ''}
                <div style={{ fontSize: 12, color: '#666' }}>{new Date(o.created_at).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

