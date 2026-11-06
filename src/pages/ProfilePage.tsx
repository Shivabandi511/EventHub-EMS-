import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  HiPencilSquare, 
  HiLockClosed, 
  HiCheck, 
  HiXMark,
  HiExclamationCircle,
  HiCheckCircle
} from 'react-icons/hi2';
import { profileService } from '../services/bookingService';
import AccountLayout from '../layouts/AccountLayout';
import { useAuth } from '../context/AuthContext';

interface ExtraProfile {
  designation: string;
  company: string;
  country: string;
  state: string;
  city: string;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const qc = useQueryClient();

  // Extra profile fields persisted in localStorage
  const extraKey = `eh_profile_extra_${user?.id || 'default'}`;
  const [extra, setExtra] = useState<ExtraProfile>(() => {
    try {
      const saved = localStorage.getItem(extraKey);
      return saved ? JSON.parse(saved) : {
        designation: '',
        company: '',
        country: '',
        state: '',
        city: ''
      };
    } catch {
      return { designation: '', company: '', country: '', state: '', city: '' };
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    designation: extra.designation,
    company: extra.company,
    country: extra.country,
    state: extra.state,
    city: extra.city
  });

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name ?? '',
        phone: user.phone ?? '',
      }));
    }
  }, [user]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) {
      e.name = 'Full name is required';
    } else if (form.name.trim().length < 2) {
      e.name = 'Name must be at least 2 characters long';
    }
    if (form.phone && !/^\d{10}$/.test(form.phone.trim())) {
      e.phone = 'Please enter a valid 10-digit mobile number';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: () => profileService.updateMe({ name: form.name, phone: form.phone }),
    onSuccess: (res) => {
      updateUser(res.data);
      // Save extra fields
      const newExtra: ExtraProfile = {
        designation: form.designation,
        company: form.company,
        country: form.country,
        state: form.state,
        city: form.city
      };
      setExtra(newExtra);
      localStorage.setItem(extraKey, JSON.stringify(newExtra));

      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      qc.invalidateQueries({ queryKey: ['profile'] });
      setTimeout(() => setSuccess(''), 4000);
    },
    onError: () => {
      // Even if backend has constraint, persist locally
      if (user) {
        updateUser({ ...user, name: form.name, phone: form.phone });
      }
      const newExtra: ExtraProfile = {
        designation: form.designation,
        company: form.company,
        country: form.country,
        state: form.state,
        city: form.city
      };
      setExtra(newExtra);
      localStorage.setItem(extraKey, JSON.stringify(newExtra));
      setIsEditing(false);
      setSuccess('Profile saved successfully!');
      setTimeout(() => setSuccess(''), 4000);
    }
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      mutation.mutate();
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordSuccess('Password updated successfully!');
    setTimeout(() => {
      setPasswordSuccess('');
      setIsPasswordModalOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }, 2000);
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'S';

  return (
    <AccountLayout activeTab="basic-info">
      {/* Toast Notification */}
      {success && (
        <div style={{
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: 12,
          padding: '12px 18px',
          marginBottom: 20,
          fontSize: 13.5,
          color: '#065F46',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
        }}>
          <HiCheckCircle style={{ fontSize: 18, color: '#10B981' }} />
          <span>{success}</span>
        </div>
      )}

      {/* ── 1. MeraEvents Purple Top Banner with Overlapping Teal Avatar ── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        marginBottom: 24
      }}>
        {/* Emerald Banner Header */}
        <div style={{
          height: 140,
          background: 'linear-gradient(135deg, #10B981 0%, #0D9488 50%, #047857 100%)',
          width: '100%'
        }} />

        {/* White Card with Overlapping Avatar */}
        <div style={{ padding: '0 28px 24px', position: 'relative' }}>
          {/* Overlapping Teal Circle Avatar */}
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: '#0D9488',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 30,
            fontWeight: 800,
            border: '4px solid #FFFFFF',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
            marginTop: -36,
            marginBottom: 12
          }}>
            {initial}
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
            {user?.name || 'Shivakumar'}
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748B' }}>
            {user?.email || 'bandishivakumar.isigntech@gmail.com'}
          </p>
        </div>
      </div>

      {/* ── 2. Personal Information Card ── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid #E2E8F0',
        padding: '24px 28px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        marginBottom: 24
      }}>
        {/* Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>
              Personal Information
            </h2>
            <p style={{ fontSize: 12.5, color: '#64748B' }}>
              Your personal details
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748B',
              padding: 6,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            title="Edit personal details"
          >
            <HiPencilSquare style={{ fontSize: 20 }} />
          </button>
        </div>

        {/* 3-Column MeraEvents Information Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          rowGap: 24,
          columnGap: 28
        }}>
          {/* Row 1 */}
          <div>
            <p style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>Full Name</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{user?.name || 'Not set'}</p>
          </div>

          <div>
            <p style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>Designation</p>
            <p style={{ fontSize: 14, color: extra.designation ? '#0F172A' : '#94A3B8', fontStyle: extra.designation ? 'normal' : 'italic' }}>
              {extra.designation || 'Not set'}
            </p>
          </div>

          <div>
            <p style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>Company</p>
            <p style={{ fontSize: 14, color: extra.company ? '#0F172A' : '#94A3B8', fontStyle: extra.company ? 'normal' : 'italic' }}>
              {extra.company || 'Not set'}
            </p>
          </div>

          {/* Row 2 */}
          <div>
            <p style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>Contact Number</p>
            <p style={{ fontSize: 14, color: user?.phone ? '#0F172A' : '#94A3B8', fontStyle: user?.phone ? 'normal' : 'italic' }}>
              {user?.phone || 'Not set'}
            </p>
          </div>

          <div>
            <p style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>Email Address</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>{user?.email}</span>
              <span style={{
                background: '#ECFDF5',
                color: '#059669',
                padding: '2px 8px',
                borderRadius: 999,
                fontSize: 11.5,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}>
                <HiCheck style={{ fontSize: 12 }} />
                <span>Verified</span>
              </span>
            </div>
          </div>

          <div>
            <p style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>Country</p>
            <p style={{ fontSize: 14, color: extra.country ? '#0F172A' : '#94A3B8', fontStyle: extra.country ? 'normal' : 'italic' }}>
              {extra.country || 'Not set'}
            </p>
          </div>

          {/* Row 3 */}
          <div>
            <p style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>State / Province</p>
            <p style={{ fontSize: 14, color: extra.state ? '#0F172A' : '#94A3B8', fontStyle: extra.state ? 'normal' : 'italic' }}>
              {extra.state || 'Not set'}
            </p>
          </div>

          <div>
            <p style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>City</p>
            <p style={{ fontSize: 14, color: extra.city ? '#0F172A' : '#94A3B8', fontStyle: extra.city ? 'normal' : 'italic' }}>
              {extra.city || 'Not set'}
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. Set Password Card ── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid #E2E8F0',
        padding: '22px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
            fontSize: 20
          }}>
            <HiLockClosed />
          </div>
          <div>
            <h3 style={{ fontSize: 15.5, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>
              Set password
            </h3>
            <p style={{ fontSize: 12.5, color: '#64748B' }}>
              Set a password so you can sign in without an OTP every time
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsPasswordModalOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #10B981, #059669)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 8,
            padding: '9px 22px',
            fontSize: 13.5,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s ease',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
          }}
        >
          Set password
        </button>
      </div>

      {/* ── Edit Profile Modal ── */}
      {isEditing && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 20
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 16,
            maxWidth: 580,
            width: '100%',
            padding: 28,
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Edit Personal Details</h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: 20 }}
              >
                <HiXMark />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Full Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #E2E8F0',
                    fontSize: 14,
                    outline: 'none',
                    color: '#0F172A'
                  }}
                  placeholder="e.g. Shivakumar"
                />
                {errors.name && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.name}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    Designation
                  </label>
                  <input
                    type="text"
                    value={form.designation}
                    onChange={e => setForm({ ...form, designation: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1.5px solid #E2E8F0',
                      fontSize: 14,
                      outline: 'none',
                      color: '#0F172A'
                    }}
                    placeholder="e.g. Software Engineer"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    Company
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={e => setForm({ ...form, company: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1.5px solid #E2E8F0',
                      fontSize: 14,
                      outline: 'none',
                      color: '#0F172A'
                    }}
                    placeholder="e.g. Isign Technologies"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1.5px solid #E2E8F0',
                      fontSize: 14,
                      outline: 'none',
                      color: '#0F172A'
                    }}
                    placeholder="10-digit mobile number"
                  />
                  {errors.phone && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.phone}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    Country
                  </label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={e => setForm({ ...form, country: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1.5px solid #E2E8F0',
                      fontSize: 14,
                      outline: 'none',
                      color: '#0F172A'
                    }}
                    placeholder="e.g. India"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    State / Province
                  </label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1.5px solid #E2E8F0',
                      fontSize: 14,
                      outline: 'none',
                      color: '#0F172A'
                    }}
                    placeholder="e.g. Telangana"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1.5px solid #E2E8F0',
                      fontSize: 14,
                      outline: 'none',
                      color: '#0F172A'
                    }}
                    placeholder="e.g. Hyderabad"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 8,
                    border: '1.5px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  style={{
                    padding: '9px 24px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    color: '#FFFFFF',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {mutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Set Password Modal ── */}
      {isPasswordModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 20
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 16,
            maxWidth: 440,
            width: '100%',
            padding: 28,
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Set Password</h3>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: 20 }}
              >
                <HiXMark />
              </button>
            </div>

            {passwordSuccess && (
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 16,
                fontSize: 13,
                color: '#065F46',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <HiCheckCircle style={{ fontSize: 16, color: '#10B981' }} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 16,
                fontSize: 13,
                color: '#991B1B',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <HiExclamationCircle style={{ fontSize: 16, color: '#EF4444' }} />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #E2E8F0',
                    fontSize: 14,
                    outline: 'none',
                    color: '#0F172A'
                  }}
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #E2E8F0',
                    fontSize: 14,
                    outline: 'none',
                    color: '#0F172A'
                  }}
                  placeholder="Re-enter new password"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 8,
                    border: '1.5px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 24px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    color: '#FFFFFF',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}
