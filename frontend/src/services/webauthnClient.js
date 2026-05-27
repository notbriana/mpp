import { startAuthentication, startRegistration } from '@simplewebauthn/browser';

function getApiBase() {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
}

export async function beginWebAuthnRegistration(refreshToken) {
  const res = await fetch(`${getApiBase()}/api/auth/webauthn/register/options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  if (!res.ok) throw new Error('webauthn_options_failed');
  const options = await res.json();
  const response = await startRegistration(options);
  const verify = await fetch(`${getApiBase()}/api/auth/webauthn/register/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken, response })
  });
  if (!verify.ok) {
    const body = await verify.json().catch(() => ({}));
    throw new Error(body.error || 'webauthn_register_failed');
  }
  return await verify.json();
}

export async function beginWebAuthnAuthentication(refreshToken) {
  const res = await fetch(`${getApiBase()}/api/auth/webauthn/auth/options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  if (!res.ok) throw new Error('webauthn_options_failed');
  const options = await res.json();
  const response = await startAuthentication(options);
  const verify = await fetch(`${getApiBase()}/api/auth/webauthn/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken, response })
  });
  if (!verify.ok) {
    const body = await verify.json().catch(() => ({}));
    throw new Error(body.error || 'webauthn_auth_failed');
  }
  return await verify.json();
}
