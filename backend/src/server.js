const express = require('express');
const cors = require('cors');
const http = require('http');
const { createHandler } = require('graphql-http/lib/use/express');
const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const validationRoutes = require('./routes/validationRoutes');
const authRoutes = require('./routes/authRoutes');
const assignmentsRoutes = require('./routes/assignmentsRoutes');
const focusRoutes = require('./routes/focusRoutes');
const generatorRoutes = require('./routes/generatorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const alertsRoutes = require('./routes/alertsRoutes');
const { initWebSocket } = require('./realtime/socketHub');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : null;

app.use(cors({
  origin: (origin, callback) => {
    if (!allowedOrigins || allowedOrigins.length === 0) return callback(null, true);
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed'), false);
  },
  credentials: true
}));
app.use(express.json());

const { attachUserContext } = require('./middleware/authMiddleware');
app.use(attachUserContext);
const { suspiciousMiddleware } = require('./middleware/suspiciousMiddleware');
app.use(suspiciousMiddleware);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const { verifyAccessToken } = require('./utils/jwt');
app.use('/graphql', createHandler({
  schema,
  rootValue: resolvers,
  context: (req) => {
    const headers = req && req.headers ? req.headers : {};
    const auth = headers['authorization'] || headers['Authorization'] || '';
    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.slice('Bearer '.length);
      const payload = verifyAccessToken(token);
      if (payload && payload.userId) return { userId: payload.userId };
    }
    const query = req && req.query ? req.query : {};
    const userId = headers['x-user-id'] || query.userId || null;
    return { userId };
  }
}));

app.use('/api/validate', validationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/generator', generatorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/alerts', alertsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    isValid: false,
    errors: {},
    message: 'Internal server error.'
  });
});

if (require.main === module) {
  let server;
  try {
    const fs = require('fs');
    const https = require('https');
    const keyPath = process.env.HTTPS_KEY_PATH;
    const certPath = process.env.HTTPS_CERT_PATH;
    if (keyPath && certPath && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      const options = { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) };
      server = https.createServer(options, app);
      console.log('Starting HTTPS server');
    }
  } catch (e) {
    console.warn('Failed to start HTTPS server, falling back to HTTP', e);
  }
  if (!server) server = http.createServer(app);
  initWebSocket(server);
  const { startDetector } = require('./data/detector');
  startDetector();
  const { sequelize } = require('./models');
  const ensureDefaultUsers = require('./data/ensureDefaultUsers');
  sequelize.sync().then(async () => {
    try {
      await ensureDefaultUsers();
    } catch (err) {
      console.error('Failed to ensure default users', err);
    }
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Validation server running on port ${PORT}`);
    });
  }).catch((err) => {
    console.error('Failed to sync DB', err);
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Validation server running (DB sync failed) on port ${PORT}`);
    });
  });
}

module.exports = app;
