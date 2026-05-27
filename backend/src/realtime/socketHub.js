const { WebSocketServer, WebSocket } = require('ws');
const { saveChatMessage } = require('../chat/chatStore');

let wss = null;
const clientsByUser = new Map();

function initWebSocket(server) {
  wss = new WebSocketServer({ server });
  wss.on('connection', (socket) => {
    socket.send(JSON.stringify({ type: 'socket:connected' }));

    socket.on('message', async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'auth' && msg.userId) {
          socket.userId = String(msg.userId);
          const set = clientsByUser.get(String(msg.userId)) || new Set();
          set.add(socket);
          clientsByUser.set(String(msg.userId), set);
          if (set.size === 1) {
            broadcast({ type: 'presence', payload: { userId: String(msg.userId), online: true } });
          }
          return;
        }

        if (msg.type === 'chat:message') {
          const payload = msg.payload || {};
          const serverId = `m-${Date.now()}-${Math.random().toString(16).slice(2)}`;
          const chat = {
            id: serverId,
            clientId: payload.clientId || null,
            from: socket.userId || String(payload.from || 'anon'),
            to: payload.to || null,
            room: payload.room || null,
            text: payload.text || '',
            timestamp: new Date().toISOString(),
            fromName: null
          };
          try {
            const models = require('../models');
            const u = await models.User.findByPk(chat.from);
            if (u && u.name) chat.fromName = u.name;
          } catch (e) {
          }
          if (chat.to && String(chat.to) === String(chat.from)) return;

          let saved = chat;
          try {
            saved = await saveChatMessage(chat);
          } catch (e) {
            console.error('Failed to save chat to MongoDB', e);
          }

          if (saved.to) {
            const targets = clientsByUser.get(String(saved.to));
            if (targets) {
              targets.forEach((t) => {
                if (t && t.readyState === WebSocket.OPEN) t.send(JSON.stringify({ type: 'chat:message', payload: saved }));
              });
            }
            const senders = clientsByUser.get(String(saved.from));
            if (senders) {
              senders.forEach((s) => {
                if (s && s.readyState === WebSocket.OPEN) s.send(JSON.stringify({ type: 'chat:message', payload: saved }));
              });
            } else {
              if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'chat:message', payload: saved }));
            }
          } else if (saved.room) {
            broadcast({ type: 'chat:message', payload: saved });
          } else {
            broadcast({ type: 'chat:message', payload: saved });
          }
        }
      } catch (e) {
        console.error('ws message error', e);
      }
    });

    socket.on('close', () => {
      if (socket.userId) {
        const set = clientsByUser.get(String(socket.userId));
        if (set) {
          set.delete(socket);
          if (set.size === 0) {
            clientsByUser.delete(String(socket.userId));
            broadcast({ type: 'presence', payload: { userId: String(socket.userId), online: false } });
          } else {
            clientsByUser.set(String(socket.userId), set);
          }
        }
      }
    });
  });
  return wss;
}

function broadcast(event) {
  if (!wss) return;
  const payload = JSON.stringify(event);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(payload);
  });
}

module.exports = {
  initWebSocket,
  broadcast,
  saveChatMessage
};

