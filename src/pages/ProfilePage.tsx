import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  HiUser, 
  HiEnvelope, 
  HiPhone, 
  HiPencilSquare, 
  HiCheckCircle, 
  HiExclamationTriangle, 
  HiShieldCheck 
} from 'react-icons/hi2';
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
      <div className="container-app page-container" style={{ maxWidth: 620 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e1b4b', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="booking-icon-box">
            <HiUser />
          </div>
          <span>My Profile</span>
        </h1>

        {/* Avatar card */}
        <div className="glass-card" style={{ padding: 28, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 76, height: 76, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, fontWeight: 800, color: 'white',
            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e1b4b', marginBottom: 4 }}>{user?.name}</h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <HiEnvelope style={{ color: '#7c3aed' }} />
              <span>{user?.email}</span>
            </p>
            <span className={`badge ${user?.role === 'ADMIN' ? 'badge-purple' : 'badge-green'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              {user?.role === 'ADMIN' ? <><HiShieldCheck /> Administrator</> : <><HiUser /> Customer</>}
            </span>
          </div>
        </div>

        {/* Success message */}
        {success && (
          <div style={{
            background: '#ecfdf5', border: '1px solid #a7f3d0',
            borderRadius: 12, padding: '12px 16px', marginBottom: 20,
            fontSize: 13, color: '#065f46', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <HiCheckCircle style={{ fontSize: 18 }} />
            <span>{success}</span>
          </div>
        )}

        {/* Edit form */}
        <div className="glass-card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e1b4b' }}>Account Information</h3>
            {!editing && (
              <button id="btn-edit-profile" className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                <HiPencilSquare style={{ fontSize: 14 }} />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label className="label" htmlFor="profile-name">
                  <HiUser style={{ fontSize: 14, color: '#7c3aed' }} />
                  <span>Full Name</span>
                </label>
                <input id="profile-name" className={`input${errors.name ? ' error' : ''}`}
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                {errors.name && <p className="error-text">{errors.name}</p>}
              </div>

              <div>
                <label className="label" htmlFor="profile-phone">
                  <HiPhone style={{ fontSize: 14, color: '#7c3aed' }} />
                  <span>Phone Number</span>
                </label>
                <input id="profile-phone" type="tel" className={`input${errors.phone ? ' error' : ''}`}
                  placeholder="9876543210" value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                {errors.phone && <p className="error-text">{errors.phone}</p>}
              </div>

              <div>
                <label className="label">
                  <HiEnvelope style={{ fontSize: 14, color: '#7c3aed' }} />
                  <span>Email (read-only)</span>
                </label>
                <input className="input" value={user?.email} disabled style={{ opacity: 0.65, cursor: 'not-allowed', background: '#faf8ff' }} />
              </div>

              {mutation.isError && (
                <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#be123c', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HiExclamationTriangle style={{ fontSize: 18 }} />
                  <span>Failed to update profile. Please try again.</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button id="btn-save-profile" type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => { setEditing(false); setErrors({}); }}>Cancel</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: <HiUser style={{ color: '#7c3aed' }} />, label: 'Full Name', value: user?.name },
                { icon: <HiEnvelope style={{ color: '#7c3aed' }} />, label: 'Email Address', value: user?.email },
                { icon: <HiPhone style={{ color: '#7c3aed' }} />, label: 'Phone Number',  value: user?.phone ?? 'Not provided' },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ borderBottom: '1px solid #ede9fe', paddingBottom: 14 }}>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {icon}
                    <span>{label}</span>
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#1e1b4b' }}>{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
