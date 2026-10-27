import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())                      e.name            = 'Full name is required';
    if (!form.email)                            e.email           = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email           = 'Enter a valid email';
    if (form.phone && !/^\d{10}$/.test(form.phone)) e.phone      = 'Enter a valid 10-digit phone';
    if (!form.password)                         e.password        = 'Password is required';
    else if (form.password.length < 6)          e.password        = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      const res = await authService.register({
        name: form.name, email: form.email,
        password: form.password, phone: form.phone || undefined,
      });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setApiError((err.response?.data as { message?: string })?.message ?? 'Registration failed. Please try again.');
      } else {
        setApiError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const field = (
    id: string, label: string, type: string,
    placeholder: string, key: keyof typeof form
  ) => (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <input
        id={id} type={type} className={`input${errors[key] ? ' error' : ''}`}
        placeholder={placeholder} value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
      />
      {errors[key] && <p className="error-text">{errors[key]}</p>}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.08) 0%, transparent 60%), #f8fafc',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, color: '#ffffff', boxShadow: '0 8px 24px rgba(37,99,235,0.25)',
          }}>🎟️</div>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
            Create an account
          </h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>Join EventHub and start discovering events</p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: 32 }}>
          {apiError && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 10, padding: '12px 16px', marginBottom: 20,
              fontSize: 13, color: '#b91c1c',
            }}>
              ⚠️ {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {field('reg-name',    'Full Name',        'text',     'John Doe',          'name')}
            {field('reg-email',   'Email Address',    'email',    'you@example.com',   'email')}
            {field('reg-phone',   'Phone (optional)', 'tel',      '9876543210',        'phone')}
            {field('reg-pass',    'Password',         'password', '••••••••',          'password')}
            {field('reg-confirm', 'Confirm Password', 'password', '••••••••',          'confirmPassword')}

            <button id="btn-register" type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 4 }} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account…</> : 'Create Account'}
            </button>
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
