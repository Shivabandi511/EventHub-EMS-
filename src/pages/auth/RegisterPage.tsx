import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  HiTicket, 
  HiUser, 
  HiEnvelope, 
  HiPhone, 
  HiLockClosed, 
  HiUserPlus, 
  HiExclamationTriangle 
} from 'react-icons/hi2';
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
    placeholder: string, key: keyof typeof form,
    icon: React.ReactElement
  ) => (
    <div>
      <label className="label" htmlFor={id}>
        {icon}
        <span>{label}</span>
      </label>
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
      background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 65%), #faf8ff',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, color: '#ffffff', boxShadow: '0 8px 24px rgba(124,58,237,0.25)',
          }}>
            <HiTicket />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e1b4b', marginBottom: 6 }}>
            Create an account
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Join EventHub and start exploring events</p>
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

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {field('reg-name', 'Full Name', 'text', 'John Doe', 'name', <HiUser style={{ fontSize: 14, color: '#7c3aed' }} />)}
            {field('reg-email', 'Email Address', 'email', 'you@example.com', 'email', <HiEnvelope style={{ fontSize: 14, color: '#7c3aed' }} />)}
            {field('reg-phone', 'Phone Number', 'tel', '9876543210 (optional)', 'phone', <HiPhone style={{ fontSize: 14, color: '#7c3aed' }} />)}
            {field('reg-pass', 'Password', 'password', '•••••••• (min 6 chars)', 'password', <HiLockClosed style={{ fontSize: 14, color: '#7c3aed' }} />)}
            {field('reg-cpass', 'Confirm Password', 'password', '••••••••', 'confirmPassword', <HiLockClosed style={{ fontSize: 14, color: '#7c3aed' }} />)}

            <button id="btn-register" type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
              {loading ? (
                <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account…</>
              ) : (
                <><HiUserPlus style={{ fontSize: 18 }} /> Create Account</>
              )}
            </button>
          </form>

          <div className="divider" />

          <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#7c3aed', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
