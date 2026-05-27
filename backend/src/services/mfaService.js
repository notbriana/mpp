const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const { createSession } = require('../data/sessions');

function getMfaMethods() {
  const raw = process.env.MFA_METHODS;
  const value = raw !== undefined ? raw : (process.env.NODE_ENV === 'test' ? '' : 'email,totp,webauthn');
  return String(value).split(',').map((x) => x.trim()).filter(Boolean);
}

async function sendEmail(to, subject, text) {
  const forceEthereal = process.env.FORCE_ETHEREAL === 'true';
  const host = process.env.SMTP_HOST;
  const portEnv = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const useLocalDevSmtp = process.env.DEV_USE_LOCAL_SMTP === 'true' || process.env.NODE_ENV === 'development';

  if (!forceEthereal && !host && !useLocalDevSmtp) {
    console.warn('[email] SMTP not configured. Set SMTP_HOST or FORCE_ETHEREAL=true.');
  }

  if (forceEthereal) {
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
      console.log('Email (ethereal forced) sent. Preview URL:', preview);
      return true;
    } catch (e) {
      console.warn('[email] Ethereal forced failed:', e.message || e);
      console.log('Email (fallback log):', { to, subject, text });
      return false;
    }
  }

  if (host) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port: portEnv || 587,
        secure: process.env.SMTP_SECURE === 'true' || (portEnv === 465),
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
      });
      await transporter.sendMail({ from: process.env.SMTP_FROM || 'noreply@example.com', to, subject, text });
      console.log('Email sent via SMTP host', host);
      return true;
    } catch (e) {
      console.warn('[email] SMTP send failed:', e.message || e);
    }
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
    console.warn('[email] Ethereal failed:', e.message || e);
    console.log('Email (fallback log):', { to, subject, text });
    return false;
  }
}

async function createMfaChallenge(user) {
  const mfaMethods = getMfaMethods();
  if (!mfaMethods.length) return null;

  const tempCode = mfaMethods.includes('email')
    ? String(Math.floor(100000 + Math.random() * 900000))
    : null;
  const tempExpires = tempCode
    ? new Date(Date.now() + (Number(process.env.MFA_CODE_EXPIRES_MS) || 10 * 60 * 1000))
    : null;
  const totpSecret = mfaMethods.includes('totp')
    ? speakeasy.generateSecret({ length: 20 }).base32
    : null;

  const session = await createSession(user.id, {
    mfaPending: true,
    mfaMethod: mfaMethods.join(','),
    mfaTempCode: tempCode,
    mfaTempExpires: tempExpires,
    mfaSecret: totpSecret
  });

  const totpSetupUri = totpSecret
    ? speakeasy.otpauthURL({ secret: totpSecret, label: `${process.env.APP_NAME || 'MPP'}:${user.email}`, algorithm: 'sha1' })
    : null;

  if (mfaMethods.includes('email') && tempCode) {
    try {
      const lines = [`Your login code: ${tempCode}`];
      if (tempExpires) lines.push(`Expires: ${tempExpires.toISOString()}`);
      if (totpSetupUri) lines.push(`TOTP setup URI: ${totpSetupUri}`);
      await sendEmail(user.email, 'Your login code', lines.join('\n'));
    } catch (e) {
      console.warn('Failed to send MFA email', e.message || e);
    }
  }

  return { session, mfaMethods, totpSetupUri };
}

module.exports = { getMfaMethods, createMfaChallenge, sendEmail };
