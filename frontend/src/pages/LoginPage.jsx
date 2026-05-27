import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/AuthPage.css';
import { loginUser, verifyMfa, requestPasswordReset } from '../services/authRepository';
import { validateLogin } from '../validators/authValidator';
import { authStore } from '../store/authStore';
import { GraduationCap } from 'lucide-react';
import { usePageTracking } from '../cookies/useCookieMonitor'; 

export function LoginPage() {
  usePageTracking('Login'); 
  
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [mfaPending, setMfaPending] = useState(false);
  const [refreshTokenValue, setRefreshTokenValue] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [totp, setTotp] = useState('');
  const [mfaMethods, setMfaMethods] = useState([]);
  const [totpSetupUri, setTotpSetupUri] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const clientErrors = validateLogin(form || {});
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    try {
      const { user, errors: validationErrors, formError, mfaPending, refreshToken, mfaMethods, totpSetupUri } = await loginUser(form);
      setErrors(validationErrors);

      if (formError) {
        setSubmitError(formError);
        return;
      }

      if (mfaPending) {
        setMfaPending(true);
        setRefreshTokenValue(refreshToken);
        setMfaMethods(Array.isArray(mfaMethods) ? mfaMethods : []);
        setTotpSetupUri(totpSetupUri || '');
        return;
      }

      if (Object.keys(validationErrors).length === 0 && user) {
        authStore.setUser(user);
        navigate('/dashboard');
      }
    } catch (error) {
      setSubmitError('Unable to reach the server.');
    }
  };

  const handleVerifyMfa = async (e) => {
    e.preventDefault();
    if (!refreshTokenValue) return setSubmitError('Missing session.');
    if (mfaMethods.includes('email') && !mfaCode) return setSubmitError('Enter the email code.');
    if (mfaMethods.includes('totp') && !totp) return setSubmitError('Enter the authenticator code.');
    try {
      const body = await verifyMfa(refreshTokenValue, mfaCode, totp);
      // store user + token
      const user = authStore.getUser() || {};
      authStore.setUser({ ...user, accessToken: body.accessToken, refreshToken: refreshTokenValue });
      navigate('/dashboard');
    } catch (err) {
      setSubmitError(err.message || 'MFA verification failed');
    }
  };

  const handleForgot = async () => {
    setForgotSent(false);
    try {
      await requestPasswordReset(forgotEmail);
      setForgotSent(true);
    } catch (e) {
      setSubmitError('Unable to request password reset');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-header">
          <div className="logo"><GraduationCap size={28} /></div>
          <h1>Welcome Back</h1>
          <p>Sign in to your Academic Planner</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-box">
          {submitError && <span className="error-text">{submitError}</span>}
          <div className="input-group">
            <label>Email Address</label>
            <input name="email" value={form.email} onChange={handleChange} placeholder="you@university.edu" className={errors.email ? 'input-error' : ''} />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" className={errors.password ? 'input-error' : ''} />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button className="auth-btn" type="submit">Sign In</button>
        </form>

        {mfaPending && (
          <form className="auth-box" onSubmit={handleVerifyMfa}>
            <h4>Three-step verification</h4>
            {mfaMethods.includes('email') && (
              <div className="input-group">
                <label>Step 2 — Email code</label>
                <input name="mfa" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} placeholder="6-digit code" />
              </div>
            )}
            {mfaMethods.includes('totp') && (
              <div className="input-group">
                <label>Step 3 — Authenticator code</label>
                <input name="totp" value={totp} onChange={(e) => setTotp(e.target.value)} placeholder="TOTP from app" />
              </div>
            )}
            {totpSetupUri && (
              <div className="input-group">
                <label>TOTP setup URI (paste in authenticator app)</label>
                <input value={totpSetupUri} readOnly />
              </div>
            )}
            <button className="auth-btn" type="submit">Verify</button>
          </form>
        )}

        <div className="auth-footer">
          <p>Forgot password? <input placeholder="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} style={{width:220}} /> <button className="btn inline" onClick={handleForgot}>Send reset</button></p>
          {forgotSent && <p className="muted">If an account exists, reset instructions were sent.</p>}
        </div>

        <div className="auth-footer">
          <p>Don’t have an account? <Link to="/register">Create one</Link></p>
        </div>

        <div className="auth-back-home">
          <Link to="/">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
