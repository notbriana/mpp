const { SMTPServer } = require('smtp-server');
const fs = require('fs');
const path = require('path');

const HOST = process.env.SMTP_HOST || '0.0.0.0';
const PORT = Number(process.env.SMTP_PORT) || 465; // default SMTPS
const KEY_PATH = process.env.SMTP_KEY_PATH || path.join(__dirname, '..', 'localhost-key.pem');
const CERT_PATH = process.env.SMTP_CERT_PATH || path.join(__dirname, '..', 'localhost-cert.pem');

let key = null;
let cert = null;
try {
  if (fs.existsSync(KEY_PATH) && fs.existsSync(CERT_PATH)) {
    key = fs.readFileSync(KEY_PATH);
    cert = fs.readFileSync(CERT_PATH);
  }
} catch (e) {
  console.warn('Could not read SMTP TLS certs:', e.message || e);
}

const serverOptions = {
  secure: !!(key && cert),
  key,
  cert,
  authOptional: true,
  disabledCommands: ['STARTTLS'], // optional: if you want strict SMTPS on 465
  onAuth(auth, session, callback) {
    // Accept any username/password in dev; in prod validate properly
    console.log('SMTP auth attempt', { username: auth.username });
    return callback(null, { user: auth.username });
  },
  onData(stream, session, callback) {
    let raw = '';
    stream.on('data', (chunk) => { raw += chunk.toString(); });
    stream.on('end', () => {
      const from = session.envelope && session.envelope.mailFrom && session.envelope.mailFrom.address;
      const to = session.envelope && session.envelope.rcptTo && session.envelope.rcptTo.map(r => r.address).join(',');
      console.log('--- SMTP message received ---');
      console.log('from:', from);
      console.log('to:', to);
      console.log(raw.slice(0, 1000));
      console.log('--- end message ---');
      callback(null);
    });
  }
};

const server = new SMTPServer(serverOptions);

server.on('error', (err) => {
  console.error('SMTP Server error', err);
});

server.listen(PORT, HOST, () => {
  console.log(`SMTP server listening on ${HOST}:${PORT} (secure=${!!serverOptions.secure})`);
  if (!serverOptions.secure) console.log('Warning: SMTP server is running without TLS certs. Use STARTTLS or provide certs.');
});
