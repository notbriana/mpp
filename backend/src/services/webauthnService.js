const {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse
} = require('@simplewebauthn/server');

const { WebAuthnCredential } = require('../models');

const challengeStore = new Map();
const CHALLENGE_TTL_MS = Number(process.env.WEBAUTHN_CHALLENGE_TTL_MS) || 5 * 60 * 1000;

function getRpId(hostname) {
  return process.env.WEBAUTHN_RP_ID || hostname;
}

function getOrigin(req) {
  return process.env.WEBAUTHN_ORIGIN || (req && req.headers ? req.headers.origin : null);
}

function keyFor(refreshToken, kind) {
  return `${refreshToken}:${kind}`;
}

function storeChallenge(refreshToken, kind, challenge) {
  challengeStore.set(keyFor(refreshToken, kind), {
    challenge,
    expiresAt: Date.now() + CHALLENGE_TTL_MS
  });
}

function getChallenge(refreshToken, kind) {
  const entry = challengeStore.get(keyFor(refreshToken, kind));
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    challengeStore.delete(keyFor(refreshToken, kind));
    return null;
  }
  return entry.challenge;
}

function clearChallenge(refreshToken, kind) {
  challengeStore.delete(keyFor(refreshToken, kind));
}

async function listCredentials(userId) {
  return await WebAuthnCredential.findAll({ where: { userId } });
}

async function createRegistrationOptions({ user, refreshToken, req }) {
  const rpID = getRpId(req.hostname);
  const rpName = process.env.WEBAUTHN_RP_NAME || 'MPP';
  const existing = await listCredentials(user.id);

  const options = generateRegistrationOptions({
    rpID,
    rpName,
    userID: String(user.id),
    userName: user.email,
    userDisplayName: user.name || user.email,
    attestationType: 'none',
    authenticatorSelection: {
      userVerification: 'required',
      residentKey: 'preferred'
    },
    excludeCredentials: existing.map((c) => ({
      id: Buffer.from(c.credentialId, 'base64url'),
      type: 'public-key'
    }))
  });

  storeChallenge(refreshToken, 'register', options.challenge);
  return options;
}

async function verifyRegistration({ user, refreshToken, body, req }) {
  const expectedChallenge = getChallenge(refreshToken, 'register');
  if (!expectedChallenge) return { ok: false, error: 'missing_challenge' };

  const expectedOrigin = getOrigin(req);
  const expectedRPID = getRpId(req.hostname);

  const result = await verifyRegistrationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin,
    expectedRPID
  });

  if (!result.verified || !result.registrationInfo) {
    return { ok: false, error: 'registration_failed' };
  }

  const info = result.registrationInfo;
  const credentialId = Buffer.from(info.credentialID).toString('base64url');
  const publicKey = Buffer.from(info.credentialPublicKey).toString('base64url');

  await WebAuthnCredential.create({
    id: info.credentialID.toString('base64url'),
    userId: user.id,
    credentialId,
    publicKey,
    counter: info.counter || 0,
    transports: Array.isArray(info.transports) ? JSON.stringify(info.transports) : null,
    deviceType: info.credentialDeviceType || null,
    backedUp: info.credentialBackedUp
  });

  clearChallenge(refreshToken, 'register');
  return { ok: true };
}

async function createAuthenticationOptions({ user, refreshToken, req }) {
  const rpID = getRpId(req.hostname);
  const credentials = await listCredentials(user.id);

  const options = generateAuthenticationOptions({
    rpID,
    userVerification: 'required',
    allowCredentials: credentials.map((c) => ({
      id: Buffer.from(c.credentialId, 'base64url'),
      type: 'public-key',
      transports: c.transports ? JSON.parse(c.transports) : undefined
    }))
  });

  storeChallenge(refreshToken, 'auth', options.challenge);
  return options;
}

async function verifyAuthentication({ user, refreshToken, body, req }) {
  const expectedChallenge = getChallenge(refreshToken, 'auth');
  if (!expectedChallenge) return { ok: false, error: 'missing_challenge' };

  const expectedOrigin = getOrigin(req);
  const expectedRPID = getRpId(req.hostname);

  const credentialId = body && body.id ? body.id : null;
  const stored = credentialId
    ? await WebAuthnCredential.findOne({ where: { userId: user.id, credentialId } })
    : null;
  if (!stored) return { ok: false, error: 'credential_not_found' };

  const result = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin,
    expectedRPID,
    authenticator: {
      credentialID: Buffer.from(stored.credentialId, 'base64url'),
      credentialPublicKey: Buffer.from(stored.publicKey, 'base64url'),
      counter: stored.counter
    }
  });

  if (!result.verified) return { ok: false, error: 'auth_failed' };

  stored.counter = result.authenticationInfo.newCounter || stored.counter;
  await stored.save();

  clearChallenge(refreshToken, 'auth');
  return { ok: true };
}

module.exports = {
  listCredentials,
  createRegistrationOptions,
  verifyRegistration,
  createAuthenticationOptions,
  verifyAuthentication
};
