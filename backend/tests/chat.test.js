const fs = require('fs');
const path = require('path');
const { saveChatMessage } = require('../src/realtime/socketHub');

describe('chat persistence', () => {
  const CHATS_FILE = path.resolve(__dirname, '../data/chats.json');
  beforeAll(() => {
    if (fs.existsSync(CHATS_FILE)) fs.unlinkSync(CHATS_FILE);
  });

  test('saves chat message to file or db', async () => {
    const msg = { id: 'm-test', from: '1', to: null, room: null, text: 'hello', timestamp: new Date().toISOString() };
    const res = await saveChatMessage(msg);
    if (fs.existsSync(CHATS_FILE)) {
      const raw = fs.readFileSync(CHATS_FILE, 'utf8');
      const data = JSON.parse(raw);
      expect(data.messages).toBeDefined();
      expect(data.messages.find(m => m.id === res.id || m.id === msg.id)).toBeTruthy();
    } else {
      expect(res).toBeDefined();
      expect(res.id).toBeDefined();
    }
  });
});
