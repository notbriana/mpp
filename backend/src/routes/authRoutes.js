const express = require('express');
const {
  findUserByEmail,
  addUser,
  updateUserPassword
} = require('../data/store');
const bcrypt = require('bcryptjs');
const { signAccessToken, verifyAccessToken } = require('../utils/jwt');
const { createSession, findSessionByToken } = require('../data/sessions');
const { updateSessionActivity, invalidateSession } = require('../data/sessions');
const {
  validateLogin,
  validateRegister,
  validatePasswordChange
} = require('../validators/authValidator');
const { logAction } = require('../data/logging');
const { v4: uuidv4 } = require('uuid');
const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');

const router = express.Router();

function safeUser(user) {
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email };
}

async function sendEmail(to, subject, text) {
  const forceEthereal = process.env.FORCE_ETHEREAL === 'true';
  const host = process.env.SMTP_HOST;
  const portEnv = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const useLocalDevSmtp = process.env.DEV_USE_LOCAL_SMTP === 'true' || process.env.NODE_ENV === 'development';

    if (forceEthereal) {
      try {
        const fs = require('fs');
        const path = require('path');
        const dir = path.join(__dirname, '..', '..', 'tmp');
        try { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
        const name = `${Date.now()}-${Math.random().toString(16).slice(2)}.eml`;
        const file = path.join(dir, name);
        const content = [`To: ${to}`, `Subject: ${subject}`, '', text].join('\n');
        fs.writeFileSync(file, content, { encoding: 'utf8' });
        console.log('Email (ethereal - forced) written to', file);
        return true;
      } catch (e) {
        console.log('Email (ethereal forced) failed to write preview, fallback log:', { to, subject, text, err: e.message || e });
        return false;
      }
    }

  if (host) {
    const transporter = nodemailer.createTransport({
      host,
      port: portEnv || 587,
      secure: process.env.SMTP_SECURE === 'true' || (portEnv === 465),
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
    });
    await transporter.sendMail({ from: process.env.SMTP_FROM || 'noreply@example.com', to, subject, text });
    console.log('Email sent via SMTP host', host);
    return true;
  }

  if (useLocalDevSmtp) {
    try {
      const localPort = portEnv || 465;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || '127.0.0.1',
        port: localPort,
        secure: true,
        tls: { rejectUnauthorized: false }
      });
      const info = await transporter.sendMail({ from: process.env.SMTP_FROM || 'noreply@example.com', to, subject, text });
      console.log('Email (local SMTPS) accepted:', info && info.messageId);
      return true;
    } catch (e) {
      console.warn('Local SMTPS send failed, falling fallback to Ethereal preview:', e.message || e);
    }
  }

  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    const info = await transporter.sendMail({ from: process.env.SMTP_FROM || 'noreply@example.com', to, subject, text });
    const preview = nodemailer.getTestMessageUrl(info);
    console.log('Email (ethereal) sent. Preview URL:', preview);
    return true;
  } catch (e) {
    console.log('Email (fallback log):', { to, subject, text });
    return false;
  }
}

router.post('/register', async (req, res) => {
  const errors = validateRegister(req.body || {});
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  if (await findUserByEmail(req.body.email)) {
    return res.status(409).json({ errors: { email: 'Email is already registered.' } });
  }


  const user = await addUser({
    name: req.body.name?.trim(),
    email: req.body.email?.trim(),
    password: req.body.password
  });

  const session = await createSession(user.id);
  const accessToken = await signAccessToken({ userId: user.id, sessionId: session.refreshToken });

  await logAction({
    userId: user.id,
    action: 'auth:register',
    actionInfo: 'User registered (REST)',
    meta: { email: user.email, source: 'rest' }
  });

  return res.status(201).json({ user: safeUser(user), accessToken, refreshToken: session.refreshToken });
});

router.post('/login', async (req, res) => {
  const errors = validateLogin(req.body || {});
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const user = await findUserByEmail(req.body.email?.trim());
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    await logAction({
      userId: user ? user.id : null,
      groupId: 'user',
      action: 'auth:login:failed',
      actionInfo: 'Login failed (REST)',
      meta: { email: req.body.email, source: 'rest' }
    });
    return res.status(401).json({ errors: { email: 'Invalid email or password.' } });
  }

  await logAction({
    userId: user.id,
    action: 'auth:login:success',
    actionInfo: 'Login successful (REST)',
    meta: { email: user.email, source: 'rest' }
  });


  const mfaMethods = (process.env.MFA_METHODS !== undefined
    ? process.env.MFA_METHODS
    : (process.env.NODE_ENV === 'test' ? '' : 'email,totp')).split(',').map(x => x.trim()).filter(Boolean);

  if (mfaMethods.length > 0) {
    const tempCode = String(Math.floor(100000 + Math.random() * 900000));
    const tempExpires = new Date(Date.now() + (Number(process.env.MFA_CODE_EXPIRES_MS) || 10 * 60 * 1000));
    const totpSecret = speakeasy.generateSecret({ length: 20 }).base32;
    const session = await createSession(user.id, { mfaPending: true, mfaMethod: mfaMethods.join(','), mfaTempCode: tempCode, mfaTempExpires: tempExpires, mfaSecret: totpSecret });

    try {
      const lines = [`Your login code: ${tempCode}`, `Expires: ${tempExpires.toISOString()}`];
      if (mfaMethods.includes('totp')) {
        const otpauth = speakeasy.otpauthURL({ secret: totpSecret, label: `${process.env.APP_NAME || 'MPP'}:${user.email}`, algorithm: 'sha1' });
        lines.push(`TOTP setup URI: ${otpauth}`);
      }
      await sendEmail(user.email, 'Your login code', lines.join('\n'));
    } catch (e) {
      console.warn('Failed to send MFA email', e.message || e);
    }

    return res.json({ user: safeUser(user), mfaPending: true, refreshToken: session.refreshToken });
  }

  const session = await createSession(user.id);
  const accessToken = await signAccessToken({ userId: user.id, sessionId: session.refreshToken });
  return res.json({ user: safeUser(user), accessToken, refreshToken: session.refreshToken });
});

router.post('/change-password', async (req, res) => {
  const errors = validatePasswordChange(req.body || {});
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const user = await findUserByEmail(req.body.email?.trim());
  if (!user) {
    return res.status(404).json({ errors: { email: 'User not found.' } });
  }
  if (!(await bcrypt.compare(req.body.currentPassword, user.password))) {
    return res.status(400).json({ errors: { currentPassword: 'Current password is incorrect.' } });
  }

  const updated = await updateUserPassword(req.body.email?.trim(), req.body.newPassword);
  await logAction({
    userId: updated.id,
    action: 'auth:changePassword',
    actionInfo: 'Password changed (REST)',
    meta: { email: updated.email, source: 'rest' }
  });
  return res.json({ user: safeUser(updated) });
});

router.post('/mfa/verify', async (req, res) => {
  const { refreshToken, code, totp } = req.body || {};
  if (!refreshToken) return res.status(400).json({ error: 'missing_refresh_token' });
  const session = await findSessionByToken(refreshToken);
  if (!session) return res.status(401).json({ error: 'invalid_session' });
  if (!session.mfaPending) return res.status(400).json({ error: 'not_pending' });
  if (!session.mfaTempCode || !session.mfaTempExpires || new Date(session.mfaTempExpires) < new Date()) {
    return res.status(400).json({ error: 'code_expired' });
  }
  if (String(session.mfaTempCode) !== String(code)) return res.status(400).json({ error: 'invalid_code' });
  if (String(session.mfaMethod || '').includes('totp')) {
    if (!totp) return res.status(400).json({ error: 'missing_totp' });
    const ok = speakeasy.totp.verify({ secret: session.mfaSecret, encoding: 'base32', token: String(totp), window: 1 });
    if (!ok) return res.status(400).json({ error: 'invalid_totp' });
  }
  session.mfaPending = false;
  session.mfaTempCode = null;
  session.mfaTempExpires = null;
  await session.save();
  const accessToken = await signAccessToken({ userId: session.userId, sessionId: session.refreshToken });
  await updateSessionActivity(session.id).catch(() => {});
  return res.json({ accessToken });
});

router.post('/password/forgot', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'missing_email' });
  const user = await findUserByEmail(email.trim());
  if (!user) return res.status(200).json({ ok: true }); 
  const token = uuidv4();
  const expires = new Date(Date.now() + (Number(process.env.PASSWORD_RESET_EXPIRES_MS) || 60 * 60 * 1000));
  try {
    user.passwordResetToken = token;
    user.passwordResetExpires = expires;
    await user.save();
  } catch (e) {}
  const link = `${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  try {
    await sendEmail(user.email, 'Password reset', `Reset your password: ${link}\nExpires: ${expires.toISOString()}`);
  } catch (e) {
    console.warn('Failed to send reset email', e.message || e);
  }
  return res.json({ ok: true });
});

router.post('/password/reset', async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) return res.status(400).json({ error: 'missing' });
  const { User } = require('../models');
  const user = await User.findOne({ where: { passwordResetToken: token } }).catch(() => null);
  if (!user || !user.passwordResetExpires || new Date(user.passwordResetExpires) < new Date()) {
    return res.status(400).json({ error: 'invalid_or_expired' });
  }
  const updated = await updateUserPassword(user.email, password);
  try {
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();
  } catch (e) {}
  await logAction({ userId: updated.id, action: 'auth:password:reset', actionInfo: 'Password reset via token', meta: { email: updated.email } });
  return res.json({ ok: true });
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(400).json({ error: 'missing_refresh_token' });
  const session = await findSessionByToken(refreshToken);
  if (!session) return res.status(401).json({ error: 'invalid' });
  const INACTIVITY_TIMEOUT_MS = Number(process.env.SESSION_INACTIVITY_MS) || (30 * 60 * 1000);
  const last = new Date(session.lastActivity).getTime();
  if (Date.now() - last > INACTIVITY_TIMEOUT_MS) {
    await invalidateSession(session.id).catch(() => {});
    return res.status(401).json({ error: 'session_expired' });
  }
  await updateSessionActivity(session.id).catch(() => {});
  const accessToken = await signAccessToken({ userId: session.userId, sessionId: session.refreshToken });
  return res.json({ accessToken });
});

router.post('/logout', async (req, res) => {
  const bodyToken = req.body && req.body.refreshToken ? req.body.refreshToken : null;
  let refreshToken = bodyToken;
  if (!refreshToken) {
    const auth = req.headers.authorization || '';
    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.slice('Bearer '.length);
      const payload = verifyAccessToken(token);
      if (payload && payload.sessionId) refreshToken = payload.sessionId;
    }
  }
  if (!refreshToken) return res.status(400).json({ error: 'missing_refresh_token' });
  try {
    const session = await findSessionByToken(refreshToken);
    if (session) await invalidateSession(session.id);
  } catch (e) {}
  return res.json({ ok: true });
});

module.exports = router;

