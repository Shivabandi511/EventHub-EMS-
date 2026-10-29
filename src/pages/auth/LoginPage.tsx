import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  HiBolt, 
  HiEnvelope, 
  HiLockClosed, 
  HiArrowRightEndOnRectangle, 
  HiExclamationTriangle, 
  HiLightBulb 
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

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

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 65%), #faf8ff',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, color: '#ffffff', boxShadow: '0 8px 24px rgba(124,58,237,0.25)',
          }}>
            <HiBolt />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e1b4b', marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Sign in to your EventHub account</p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: 32 }}>
          {apiError && (
            <div style={{
              background: '#fff1f2', border: '1px solid #fecdd3',
              borderRadius: 10, padding: '12px 16px', marginBottom: 20,
              fontSize: 13, color: '#be123c', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <HiExclamationTriangle style={{ fontSize: 18, flexShrink: 0 }} />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email */}
            <div>
              <label className="label" htmlFor="login-email">
                <HiEnvelope style={{ fontSize: 14, color: '#7c3aed' }} />
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
                <HiLockClosed style={{ fontSize: 14, color: '#7c3aed' }} />
                <span>Password</span>
              </label>
              <input
                id="login-password" type="password" className={`input${errors.password ? ' error' : ''}`}
                placeholder="••••••••" value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              />
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

          <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#7c3aed', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>

        {/* Demo hint */}
        <div style={{
          marginTop: 16, padding: '12px 16px', borderRadius: 10,
          background: '#faf5ff', border: '1px solid #d8b4fe',
          fontSize: 12, color: '#6d28d9', textAlign: 'center',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <HiLightBulb style={{ fontSize: 16, flexShrink: 0, color: '#d97706' }} />
          <span>Demo: use <strong>admin@eventhub.com</strong> / <strong>admin123</strong> for admin access</span>
        </div>
      </div>
    </div>
  );
}
