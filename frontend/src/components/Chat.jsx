/**
 * Chat.jsx — Instagram-style DM chat
 *
 * KEY CHANGES FROM ORIGINAL:
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. NO localStorage — messages come from MongoDB via REST/GraphQL only.
 *    Persistence survives server restarts because they're in the database.
 *
 * 2. Tab-switch safe — loadHistory() fires on every `visibilitychange` (tab
 *    focus) so switching tabs and returning always shows current messages.
 *
 * 3. Deduplication by real DB id — optimistic messages are keyed by clientId;
 *    when the server echoes back the same message with a real id, the local
 *    placeholder is replaced in-place (no duplicate bubbles).
 *
 * 4. Socket auth — connectSocket(userId) now sends an `auth` event so the
 *    server routes messages to the right Socket.IO room.
 *
 * 5. REST fallback for history — if GraphQL returns nothing, falls back to
 *    GET /api/conversation/:otherUserId which is scoped to the logged-in user.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { connectSocket, onMessage, sendChatMessage } from '../services/socketClient';
import { getAuthUser } from '../store/authStore';
import { gqlRequest } from '../services/graphqlClient';
import { useLocation } from 'react-router-dom';
import '../styles/ChatPanel.css';

function resolveApiBase() {
  const apiEnv = import.meta.env.VITE_API_BASE_URL;
  if (apiEnv) return apiEnv;
  const wsEnv = import.meta.env.VITE_WS_URL;
  if (wsEnv) {
    try {
      const parsed = new URL(wsEnv);
      const protocol = parsed.protocol === 'wss:' ? 'https:' : 'http:';
      return `${protocol}//${parsed.hostname}:${parsed.port || '3001'}`;
    } catch (_) {}
  }
  try {
    const parsed = new URL(window.location.origin);
    const port = parsed.port && parsed.port !== '5173' ? parsed.port : '3001';
    return `${parsed.protocol}//${parsed.hostname}:${port}`;
  } catch (_) {
    return 'http://localhost:3001';
  }
}

const API_BASE = resolveApiBase();

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [nameMap, setNameMap] = useState({});
  const [loadingHistory, setLoadingHistory] = useState(false);

  const nameMapRef = useRef({});
  const messagesEndRef = useRef(null);

  const user = getAuthUser();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const targetUserId = params.get('to') ? String(params.get('to')) : null;

  const selfName = user?.name || (user?.email ? user.email.split('@')[0] : 'You');
  const targetName = targetUserId
    ? (nameMap[targetUserId] || `User ${targetUserId}`)
    : '';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const enrichMessage = useCallback((m) => {
    const map = nameMapRef.current;
    if (String(m.from) === String(user?.id)) {
      return { ...m, fromName: selfName };
    }
    return { ...m, fromName: m.fromName || map[String(m.from)] || m.from };
  }, [user, selfName]);

  const loadHistory = useCallback(async () => {
    if (!user?.id || !targetUserId) return;
    setLoadingHistory(true);

    try {
      let msgs = [];
      try {
        const data = await gqlRequest(
          `query Conv($userId: ID!, $withUserId: String!) {
            conversation(userId: $userId, withUserId: $withUserId) {
              id from to room text timestamp clientId fromName
            }
          }`,
          { userId: user.id, withUserId: targetUserId }
        );
        msgs = data?.conversation || [];
      } catch (_) {
        const res = await fetch(
          `${API_BASE}/api/conversation/${targetUserId}`,
          { headers: { Authorization: `Bearer ${user.id}` } }
        ).catch(() => null);
        if (res?.ok) {
          const json = await res.json().catch(() => ({}));
          msgs = Array.isArray(json.messages) ? json.messages : [];
        }
      }

      const sorted = msgs
        .map(enrichMessage)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      setMessages(prev => {
        const confirmedIds = new Set(sorted.map(m => m.id));
        const pendingOptimistic = prev.filter(
          m => m.id?.startsWith('local-') && !confirmedIds.has(m.clientId)
        );
        return [...sorted, ...pendingOptimistic];
      });
    } catch (err) {
      console.error('[Chat] loadHistory error:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [user, targetUserId, enrichMessage]);

  const loadUsers = useCallback(async () => {
    try {
      const data = await gqlRequest(`query { users { id name } }`);
      const map = {};
      if (Array.isArray(data?.users)) {
        data.users.forEach(u => { map[String(u.id)] = u.name; });
      }
      if (Object.keys(map).length) {
        nameMapRef.current = map;
        setNameMap(map);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    connectSocket(user.id);
    loadUsers().then(() => loadHistory());

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') loadHistory();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const off = onMessage((event) => {
      if (event.type !== 'chat:message') return;
      const incoming = event.payload || {};
      const mine = String(user.id);

      const isRelevant =
        (String(incoming.from) === targetUserId && String(incoming.to) === mine) ||
        (String(incoming.from) === mine && String(incoming.to) === targetUserId);
      if (!isRelevant) return;

      const enriched = enrichMessage(incoming);

      setMessages(prev => {
        if (prev.some(x => x.id === enriched.id)) return prev;

        if (enriched.clientId) {
          const idx = prev.findIndex(x => x.id === enriched.clientId);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...enriched };
            return next;
          }
        }

        return [...prev, enriched];
      });
    });

    return () => {
      off();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [user?.id, targetUserId, loadHistory, loadUsers, enrichMessage]);

  const submit = (e) => {
    e?.preventDefault();
    if (!text.trim() || !targetUserId) return;
    if (String(user?.id) === targetUserId) return; // no self-messages

    const tempId = `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const optimistic = {
      id: tempId,
      clientId: tempId,
      from: String(user.id),
      to: targetUserId,
      room: null,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      fromName: selfName
    };

    setMessages(prev => [...prev, optimistic]);
    sendChatMessage({ to: targetUserId, text: text.trim(), clientId: tempId });
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const headerName = (() => {
    if (!targetUserId) return '';
    return nameMap[targetUserId]
      || messages.find(m => String(m.from) === targetUserId)?.fromName
      || `User ${targetUserId}`;
  })();

  const headerInitial = (headerName || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="chat-shell">
      <div className="chat-header">
        <div className="chat-title">Messages</div>
        {targetUserId && (
          <div className="chat-contact">
            <div className="chat-avatar" aria-hidden="true">{headerInitial}</div>
            <div>
              <div className="chat-contact-name">{headerName}</div>
              <div className="chat-contact-status">Active now</div>
            </div>
          </div>
        )}
      </div>

      <div className="chat-messages" aria-live="polite" aria-label="Messages">
        {!targetUserId && (
          <div className="chat-empty">Select a conversation to start chatting</div>
        )}

        {targetUserId && loadingHistory && messages.length === 0 && (
          <div className="chat-loading">Loading messages…</div>
        )}

        {messages.map((m) => {
          const isMine = String(m.from) === String(user?.id);
          const isPending = m.id?.startsWith('local-');
          return (
            <div key={m.id} className={`chat-row ${isMine ? 'is-mine' : ''}`}>
              {!isMine && (
                <div className="chat-avatar chat-avatar--sm" aria-hidden="true">
                  {(m.fromName || m.from || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <div className={`chat-bubble ${isPending ? 'chat-bubble--pending' : ''}`}>
                {!isMine && (
                  <div className="chat-sender">{m.fromName || m.from}</div>
                )}
                <div className="chat-text">{m.text}</div>
                <div className="chat-bubble-meta">
                  <span className="chat-time">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMine && (
                    <span className="chat-status" aria-label={isPending ? 'Sending' : 'Sent'}>
                      {isPending ? '○' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={submit} className="chat-input-row">
        <input
          className="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={targetUserId ? `Message ${headerName || 'user'}…` : 'Select a conversation'}
          disabled={!targetUserId}
          autoComplete="off"
        />
        <button
          type="submit"
          className="chat-send"
          disabled={!targetUserId || !text.trim()}
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </div>
  );
}
