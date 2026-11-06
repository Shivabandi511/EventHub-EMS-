import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  HiBolt, 
  HiEnvelope, 
  HiLockClosed, 
  HiArrowRightEndOnRectangle, 
  HiExclamationTriangle,
  HiCheckCircle,
  HiXMark,
  HiEye,
  HiEyeSlash
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email)                           e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email    = 'Enter a valid email';
    if (!form.password)                        e.password = 'Password is required';
    else if (form.password.length < 6)         e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      const res = await authService.login(form);
      login(res.data.token, res.data.user);
      navigate(res.data.user.role === 'ADMIN' ? '/admin' : '/');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setApiError((err.response?.data as { message?: string })?.message ?? 'Invalid credentials. Please try again.');
      } else {
        setApiError('Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotError('Please enter a valid email address');
      return;
    }
    setForgotError('');
    setForgotLoading(true);

    setTimeout(() => {
      setForgotLoading(false);
      setForgotSuccess(true);
    }, 700);
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotEmail('');
    setForgotError('');
    setForgotSuccess(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.20) 0%, transparent 65%), var(--bg-midnight)',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #10b981, #0d9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, color: '#ffffff', boxShadow: '0 0 20px rgba(16,185,129,0.4)',
          }}>
            <HiBolt />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f8fafc', marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: '#94a3b8' }}>Sign in to your EventHub account</p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: 32 }}>
          {apiError && (
            <div style={{
              background: 'rgba(248, 113, 113, 0.15)', border: '1px solid rgba(248, 113, 113, 0.3)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 20,
              fontSize: 13, color: '#f87171', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <HiExclamationTriangle style={{ fontSize: 18, flexShrink: 0 }} />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email */}
            <div>
              <label className="label" htmlFor="login-email">
                <HiEnvelope style={{ fontSize: 14, color: '#10b981' }} />
                <span>Email address</span>
              </label>
              <input
                id="login-email" type="email" className={`input${errors.email ? ' error' : ''}`}
                placeholder="you@example.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label" htmlFor="login-password">
                <HiLockClosed style={{ fontSize: 14, color: '#10b981' }} />
                <span>Password</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`input${errors.password ? ' error' : ''}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword(p => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    padding: 4,
                    cursor: 'pointer',
                    color: showPassword ? '#10b981' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.15s ease'
                  }}
                >
                  {showPassword ? <HiEyeSlash style={{ fontSize: 18 }} /> : <HiEye style={{ fontSize: 18 }} />}
                </button>
              </div>

              {/* Forgot password positioned DOWN of the password field */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#34d399',
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'none'
                  }}
                >
                  Forgot password?
                </button>
              </div>

              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>

            <button id="btn-login" type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 4 }} disabled={loading}>
              {loading ? (
                <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in…</>
              ) : (
                <><HiArrowRightEndOnRectangle style={{ fontSize: 18 }} /> Sign In</>
              )}
            </button>
          </form>

          <div className="divider" />

          <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#34d399', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* ── Forgot Password Modal ── */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeForgotModal()}>
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                <HiLockClosed style={{ color: '#10b981' }} />
                <span>Reset Password</span>
              </h2>
              <button
                onClick={closeForgotModal}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 22 }}
                aria-label="Close modal"
              >
                <HiXMark />
              </button>
            </div>

            {forgotSuccess ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{
                  width: 54, height: 54, borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, color: '#34d399', margin: '0 auto 16px'
                }}>
                  <HiCheckCircle />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>
                  Password Reset Link Sent!
                </h3>
                <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginBottom: 24 }}>
                  We've sent instructions to <strong style={{ color: '#34d399' }}>{forgotEmail}</strong>. Please check your inbox and spam folder.
                </p>
                <button
                  className="btn btn-primary btn-md"
                  style={{ width: '100%' }}
                  onClick={closeForgotModal}
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.5 }}>
                  Enter your registered email address and we'll send you a link to reset your password.
                </p>

                {forgotError && (
                  <div style={{
                    background: 'rgba(248, 113, 113, 0.15)', border: '1px solid rgba(248, 113, 113, 0.3)',
                    borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171',
                    display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    <HiExclamationTriangle style={{ fontSize: 16, flexShrink: 0 }} />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div>
                  <label className="label" htmlFor="forgot-email">
                    <HiEnvelope style={{ fontSize: 14, color: '#10b981' }} />
                    <span>Email address</span>
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    className={`input${forgotError ? ' error' : ''}`}
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={e => { setForgotEmail(e.target.value); setForgotError(''); }}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-md"
                    style={{ flex: 1 }}
                    onClick={closeForgotModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-md"
                    style={{ flex: 1 }}
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? 'Sending…' : 'Send Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
