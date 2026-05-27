const { MongoClient } = require('mongodb');

let mongoClient = null;
let mongoDb = null;
let chatCollection = null;

function resolveMongoUrl() {
  return process.env.MONGO_URL || 'mongodb://localhost:27017/mpp';
}

async function getCollection() {
  if (chatCollection) return chatCollection;

  const url = resolveMongoUrl();
  mongoClient = new MongoClient(url);
  await mongoClient.connect();
  mongoDb = mongoClient.db();
  chatCollection = mongoDb.collection('chat_messages');

  try {
    await chatCollection.createIndex({ from: 1, to: 1, timestamp: 1 });
    await chatCollection.createIndex({ timestamp: -1 });
  } catch (e) {
  }

  return chatCollection;
}

function mapDoc(doc) {
  const timestamp = doc.timestamp instanceof Date
    ? doc.timestamp.toISOString()
    : new Date(doc.timestamp || Date.now()).toISOString();
  return {
    id: String(doc._id),
    clientId: doc.clientId || null,
    from: String(doc.from),
    to: doc.to ? String(doc.to) : null,
    room: doc.room || null,
    text: doc.text || '',
    timestamp,
    fromName: doc.fromName || null
  };
}

async function saveChatMessage(chat) {
  try {
    const collection = await getCollection();
    const doc = {
      clientId: chat.clientId || null,
      from: String(chat.from),
      to: chat.to ? String(chat.to) : null,
      room: chat.room || null,
      text: chat.text || '',
      timestamp: chat.timestamp ? new Date(chat.timestamp) : new Date(),
      fromName: chat.fromName || null
    };

    const result = await collection.insertOne(doc);
    return mapDoc({ ...doc, _id: result.insertedId });
  } catch (e) {
    try {
      const fs = require('fs');
      const path = require('path');
      const file = path.resolve(__dirname, '../../data/chats.json');
      let data = { messages: [] };
      if (fs.existsSync(file)) {
        data = JSON.parse(fs.readFileSync(file, 'utf8') || '{"messages":[]}');
      }
      const id = `f-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const doc = {
        id,
        clientId: chat.clientId || null,
        from: String(chat.from),
        to: chat.to ? String(chat.to) : null,
        room: chat.room || null,
        text: chat.text || '',
        timestamp: chat.timestamp ? new Date(chat.timestamp).toISOString() : new Date().toISOString(),
        fromName: chat.fromName || null
      };
      data.messages = data.messages || [];
      data.messages.push(doc);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
      return doc;
    } catch (fe) {
      throw e;
    }
  }
}

async function listChats(limit) {
  const collection = await getCollection();
  const l = Math.min(Number(limit) || 200, 2000);
  const docs = await collection.find({}).sort({ timestamp: -1 }).limit(l).toArray();
  return docs.map(mapDoc);
}

async function getConversation(userId, withUserId) {
  if (!userId || !withUserId) return [];
  const collection = await getCollection();
  const uid = String(userId);
  const other = String(withUserId);
  const docs = await collection.find({
    $or: [
      { from: uid, to: other },
      { from: other, to: uid }
    ]
  }).sort({ timestamp: 1 }).toArray();
  return docs.map(mapDoc);
}

module.exports = {
  saveChatMessage,
  listChats,
  getConversation
};
