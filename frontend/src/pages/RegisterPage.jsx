import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/AuthPage.css';
import { registerUser, verifyMfa } from '../services/authRepository';
import { validateRegister } from '../validators/authValidator';
import { authStore } from '../store/authStore';
import { GraduationCap } from 'lucide-react';
import { usePageTracking } from '../cookies/useCookieMonitor'; 

export function RegisterPage() {
  usePageTracking('Register'); 
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [mfaPending, setMfaPending] = useState(false);
  const [refreshTokenValue, setRefreshTokenValue] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [totp, setTotp] = useState('');
  const [mfaMethods, setMfaMethods] = useState([]);
  const [totpSetupUri, setTotpSetupUri] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const clientErrors = validateRegister(form || {});
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    try {
      const { user, errors: validationErrors, formError, mfaPending, refreshToken, mfaMethods, totpSetupUri } = await registerUser(form);
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
      const user = authStore.getUser() || {};
      authStore.setUser({ ...user, accessToken: body.accessToken, refreshToken: refreshTokenValue });
      navigate('/dashboard');
    } catch (err) {
      setSubmitError(err.message || 'MFA verification failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-header">
          <div className="logo"><GraduationCap size={28} /></div>
          <h1>Create Account</h1>
          <p>Get started with Academic Planner</p>
        </div>

        <form className="auth-box" onSubmit={handleSubmit}>
          {submitError && <span className="error-text">{submitError}</span>}
          <div className="input-group">
            <label>Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className={errors.name ? 'input-error' : ''} />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input name="email" value={form.email} onChange={handleChange} placeholder="john@university.edu" className={errors.email ? 'input-error' : ''} />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" className={errors.password ? 'input-error' : ''} />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter your password" className={errors.confirmPassword ? 'input-error' : ''} />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button className="auth-btn" type="submit">Create Account</button>
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
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>

        <div className="auth-back-home">
          <Link to="/">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
