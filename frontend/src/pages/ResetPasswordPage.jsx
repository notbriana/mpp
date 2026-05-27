import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authRepository';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Invalid password reset link</h2>
        <p>The reset link is missing a token. Please request a new password reset.</p>
      </div>
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!password || password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirm) return setError('Passwords do not match');
    setBusy(true);
    try {
      const ok = await resetPassword(token, password);
      if (ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError('Failed to reset password. Link may be expired.');
      }
    } catch (err) {
      setError(err.message || 'Unexpected error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '48px auto', padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', borderRadius: 8 }}>
      <h2>Reset Password</h2>
      {success ? (
        <div>Password reset successful — redirecting to login...</div>
      ) : (
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label>New password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoFocus style={{ width: '100%', padding: 8 }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Confirm password</label>
            <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" style={{ width: '100%', padding: 8 }} />
          </div>
          {error && <div style={{ color: 'crimson', marginBottom: 12 }}>{error}</div>}
          <div>
            <button type="submit" disabled={busy} style={{ padding: '8px 12px' }}>{busy ? 'Saving...' : 'Reset Password'}</button>
          </div>
        </form>
      )}
    </div>
  );
}
