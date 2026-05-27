const WebSocket = require('ws');

const WS_URL = process.env.WS_URL || 'ws://localhost:3001';

function makeClient(userId) {
  const ws = new WebSocket(WS_URL);
  ws.on('open', () => {
    console.log(`[${userId}] open`);
    ws.send(JSON.stringify({ type: 'auth', userId: String(userId) }));
  });
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      console.log(`[${userId}] recv:`, msg.type, msg.payload ? JSON.stringify(msg.payload) : '');
    } catch (e) { console.log('parse', e); }
  });
  ws.on('close', () => console.log(`[${userId}] closed`));
  ws.on('error', (e) => console.error(`[${userId}] error`, e));
  return ws;
}

async function run() {
  const a = makeClient(101);
  const b = makeClient(202);

  await new Promise(r => setTimeout(r, 800));

  a.send(JSON.stringify({ type: 'chat:message', payload: { from: '101', to: '202', text: 'Hello from A', clientId: 'c1' } }));

  await new Promise(r => setTimeout(r, 400));

  b.send(JSON.stringify({ type: 'chat:message', payload: { from: '202', to: '101', text: 'Reply from B', clientId: 'c2' } }));

  await new Promise(r => setTimeout(r, 800));

  a.close();
  b.close();
}

run().catch(console.error);
