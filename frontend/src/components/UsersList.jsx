import React, { useEffect, useState } from 'react';
import { gqlRequest } from '../services/graphqlClient';
import { useNavigate } from 'react-router-dom';
import { getAuthUser } from '../store/authStore';
import unreadStore from '../services/unreadStore';
import { connectSocket, onMessage } from '../services/socketClient';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  async function load() {
    try {
      const data = await gqlRequest(`query { users { id name email } }`);
      setUsers(data.users || []);
    } catch (e) { console.error(e); }
  }

  useEffect(() => { load(); }, []);

  const me = getAuthUser();
  const [unreads, setUnreads] = useState({});
  const [lastByUser, setLastByUser] = useState({});

  useEffect(() => {
    const unsubU = unreadStore.subscribe(u => setUnreads({ ...u }));
    return () => { unsubU(); };
  }, []);

  async function loadChatSummary() {
    try {
      if (!me?.id) return;
      const data = await gqlRequest(`query($limit:Int){ chats(limit:$limit){ id from to text timestamp } }`, { limit: 1000 });
      const map = {};
      const mine = String(me.id);
      (data?.chats || []).forEach((m) => {
        const from = String(m.from);
        const to = m.to != null ? String(m.to) : null;
        if (!to) return;
        let other = null;
        if (from === mine) other = to;
        else if (to === mine) other = from;
        if (!other) return;
        const prev = map[other];
        if (!prev || new Date(m.timestamp).getTime() > new Date(prev.timestamp).getTime()) {
          map[other] = m;
        }
      });
      setLastByUser(map);
    } catch (e) {  }
  }

  useEffect(() => {
    if (!me?.id) return;
    connectSocket(me.id);
    loadChatSummary();
    const off = onMessage((msg) => {
      if (msg.type !== 'chat:message') return;
      const m = msg.payload || {};
      const from = String(m.from);
      const to = m.to != null ? String(m.to) : null;
      if (!to) return;
      const mine = String(me.id);
      let other = null;
      if (from === mine) other = to;
      else if (to === mine) other = from;
      if (!other) return;
      setLastByUser((prev) => {
        const next = { ...prev };
        const prevMsg = next[other];
        if (!prevMsg || new Date(m.timestamp).getTime() > new Date(prevMsg.timestamp).getTime()) {
          next[other] = m;
        }
        return next;
      });
    });
    return () => off();
  }, [me?.id]);

  return (
    <div className="afp-card" style={{ textAlign: 'left' }}>
      <h2 style={{ marginTop: 0 }}>Users</h2>
      <div>
        {users.map(u => (
          <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 8px', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{u.name}</div>
              <div style={{ color: 'var(--text)', fontSize: 13 }}>{u.email}</div>
              {lastByUser[String(u.id)] && (
                <div style={{ color: 'var(--text)', fontSize: 12, marginTop: 4 }}>
                  Last: {lastByUser[String(u.id)].text}
                </div>
              )}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {unreads[String(u.id)] > 0 && (
                  <div style={{ background: 'var(--accent)', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>{unreads[String(u.id)]}</div>
                )}
                {String(me?.id) === String(u.id)
                  ? <button className="btn-outline" disabled>It's you</button>
                  : <button className="btn-outline" onClick={() => { unreadStore.resetUnread(u.id); navigate(`/chat?to=${u.id}`); }}>Chat</button>
                }
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
