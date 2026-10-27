import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/bookingService';
import CustomerLayout from '../layouts/CustomerLayout';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const qc = useQueryClient();

  const [editing, setEditing]   = useState(false);
  const [form,    setForm]      = useState({ name: user?.name ?? '', phone: user?.phone ?? '' });
  const [errors,  setErrors]    = useState<Record<string, string>>({});
  const [success, setSuccess]   = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())                           e.name  = 'Name is required';
    if (form.phone && !/^\d{10}$/.test(form.phone))  e.phone = 'Enter a valid 10-digit phone';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: () => profileService.updateMe(form),
    onSuccess: (res) => {
      updateUser(res.data);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      qc.invalidateQueries({ queryKey: ['profile'] });
      setTimeout(() => setSuccess(''), 4000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) mutation.mutate();
  };

  return (
    <CustomerLayout>
      <div className="container-app" style={{ padding: '40px 24px', maxWidth: 580 }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 32, fontWeight: 800, color: '#e2e8f0', marginBottom: 32 }}>
          My Profile
        </h1>

        {/* Avatar card */}
        <div className="glass-card" style={{ padding: 28, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: 'white',
            boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 22, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>{user?.name}</h2>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>✉️ {user?.email}</p>
            <span className={`badge ${user?.role === 'ADMIN' ? 'badge-purple' : 'badge-cyan'}`}>
              {user?.role === 'ADMIN' ? '👑 Admin' : '👤 Customer'}
            </span>
          </div>
        </div>

        {/* Success message */}
        {success && (
          <div style={{
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 20,
            fontSize: 13, color: '#4ade80',
          }}>
            ✅ {success}
          </div>
        )}

        {/* Edit form */}
        <div className="glass-card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>Personal Information</h3>
            {!editing && (
              <button id="btn-edit-profile" className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>✏️ Edit</button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label className="label" htmlFor="profile-name">Full Name</label>
                <input id="profile-name" className={`input${errors.name ? ' error' : ''}`}
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                {errors.name && <p className="error-text">{errors.name}</p>}
              </div>
              <div>
                <label className="label" htmlFor="profile-phone">Phone</label>
                <input id="profile-phone" type="tel" className={`input${errors.phone ? ' error' : ''}`}
                  placeholder="9876543210" value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                {errors.phone && <p className="error-text">{errors.phone}</p>}
              </div>
              <div>
                <label className="label">Email (cannot change)</label>
                <input className="input" value={user?.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              </div>

              {mutation.isError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171' }}>
                  ⚠️ Failed to update profile. Try again.
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button id="btn-save-profile" type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => { setEditing(false); setErrors({}); }}>Cancel</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Full Name', value: user?.name },
                { label: 'Email',     value: user?.email },
                { label: 'Phone',     value: user?.phone ?? 'Not provided' },
              ].map(({ label, value }) => (
                <div key={label} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 16 }}>
                  <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: 15, fontWeight: 500, color: '#e2e8f0' }}>{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
