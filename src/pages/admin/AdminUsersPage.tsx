import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  HiUsers,
  HiShieldCheck,
  HiUserPlus,
  HiMagnifyingGlass,
  HiFunnel,
  HiCheckCircle,
  HiNoSymbol,
  HiXMark,
  HiExclamationTriangle,
  HiExclamationCircle,
  HiCalendarDays,
  HiUser
} from 'react-icons/hi2';
import { userService, type AdminUser } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../layouts/AdminLayout';

interface CreateAdminForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'ADMIN' | 'CUSTOMER';
}

const EMPTY_FORM: CreateAdminForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  role: 'ADMIN',
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<CreateAdminForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['super-admin-users'],
    queryFn: () => userService.getAllUsers(),
  });

  const users: AdminUser[] = useMemo(() => data?.data ?? [], [data?.data]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN' }) =>
      userService.updateUserRole(id, role),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['super-admin-users'] });
      const updated = res.data;
      showToast(
        updated.role === 'ADMIN'
          ? `${updated.name} has been granted Admin access to create & manage events.`
          : `${updated.name}'s Admin access was revoked.`
      );
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      userService.createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        role: form.role,
      }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['super-admin-users'] });
      setShowCreateModal(false);
      setForm(EMPTY_FORM);
      setErrors({});
      setSubmitted(false);
      showToast(`Created ${res.data.role === 'ADMIN' ? 'Admin' : 'Candidate'} account for ${res.data.name}.`);
    },
  });

  const validateForm = (f = form): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!f.name.trim() || f.name.trim().length < 2) errs.name = 'Full name must be at least 2 characters';
    if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) errs.email = 'Valid email address is required';
    if (!f.password || f.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (f.phone.trim() && !/^[+\d\s-]{8,15}$/.test(f.phone.trim())) errs.phone = 'Enter a valid phone number';
    return errs;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validateForm();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      createMutation.mutate();
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? '').toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, searchQuery]);

  const counts = useMemo(() => ({
    total: users.length,
    superAdmins: users.filter(u => u.role === 'SUPER_ADMIN').length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    customers: users.filter(u => u.role === 'CUSTOMER').length,
  }), [users]);

  return (
    <AdminLayout>
      <div style={{ maxWidth: 1100 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 10 }}>
              <HiUsers style={{ color: '#10B981' }} />
              <span>Manage Admins & Users</span>
            </h1>
            <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>
              Assign Admin privileges to any user so they can create and manage their own events.
            </p>
          </div>
          <button
            id="btn-create-admin-user"
            className="btn btn-primary btn-md"
            onClick={() => { setForm(EMPTY_FORM); setErrors({}); setSubmitted(false); setShowCreateModal(true); }}
          >
            <HiUserPlus style={{ fontSize: 18 }} />
            <span>Create Admin / User</span>
          </button>
        </div>

        {/* Toast Notification */}
        {toastMsg && (
          <div style={{
            marginBottom: 20,
            padding: '12px 16px',
            borderRadius: 12,
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            fontSize: 13.5,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <HiCheckCircle style={{ fontSize: 18, color: '#10B981', flexShrink: 0 }} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Accounts', value: counts.total, icon: <HiUsers style={{ color: '#059669' }} />, bg: '#ECFDF5' },
            { label: 'Event Admins', value: counts.admins, icon: <HiShieldCheck style={{ color: '#10B981' }} />, bg: '#F0FDF4' },
            { label: 'Candidates (Users)', value: counts.customers, icon: <HiUser style={{ color: '#0D9488' }} />, bg: '#F0FDFA' },
            { label: 'Super Admins', value: counts.superAdmins, icon: <HiShieldCheck style={{ color: '#D97706' }} />, bg: '#FFFBEB' },
          ].map(stat => (
            <div key={stat.label} className="glass-card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                {stat.icon}
              </div>
              <div>
                <p style={{ fontSize: 12.5, color: '#64748B', fontWeight: 500 }}>{stat.label}</p>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 22, fontWeight: 800, color: '#0F172A' }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Card */}
        <div className="filter-card" style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ position: 'relative' }}>
            <HiMagnifyingGlass style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 18 }} />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: 42 }}
              placeholder="Search user by name, email, or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
              <HiFunnel style={{ fontSize: 14 }} /> Role:
            </span>
            {[
              { id: 'ALL', label: 'All Accounts' },
              { id: 'CUSTOMER', label: 'Candidates' },
              { id: 'ADMIN', label: 'Event Admins' },
              { id: 'SUPER_ADMIN', label: 'Super Admins' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`filter-chip ${roleFilter === tab.id ? 'active' : ''}`}
                onClick={() => setRoleFilter(tab.id as typeof roleFilter)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="table-container">
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="state-box">
              <div className="state-icon"><HiUsers /></div>
              <p style={{ color: '#64748B', fontWeight: 500 }}>No matching users found.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {['User', 'Phone', 'Role', 'Events Hosted', 'Admin Permission'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => {
                    const isSelf = u.email === currentUser?.email;
                    const isSuper = u.role === 'SUPER_ADMIN';
                    const isEvAdmin = u.role === 'ADMIN';
                    return (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: '50%',
                              background: isSuper ? '#047857' : isEvAdmin ? '#10B981' : '#E2E8F0',
                              color: isSuper || isEvAdmin ? '#FFFFFF' : '#475569',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: 14, flexShrink: 0,
                            }}>
                              {u.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                                {u.name} {isSelf && <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>(You)</span>}
                              </p>
                              <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: 13, color: '#475569' }}>{u.phone || '—'}</td>
                        <td>
                          <span className={`badge ${isSuper ? 'badge-yellow' : isEvAdmin ? 'badge-green' : 'badge-slate'}`}>
                            {isSuper ? 'Super Admin' : isEvAdmin ? 'Event Admin' : 'Candidate'}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <HiCalendarDays style={{ color: '#10B981' }} />
                            <span>{u.eventsCount ?? 0}</span>
                          </span>
                        </td>
                        <td>
                          {isSuper ? (
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                              Full Platform Access
                            </span>
                          ) : isEvAdmin ? (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              disabled={roleMutation.isPending}
                              onClick={() => roleMutation.mutate({ id: u.id, role: 'CUSTOMER' })}
                            >
                              <HiNoSymbol style={{ fontSize: 14 }} />
                              <span>Revoke Admin</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              disabled={roleMutation.isPending}
                              onClick={() => roleMutation.mutate({ id: u.id, role: 'ADMIN' })}
                            >
                              <HiShieldCheck style={{ fontSize: 15 }} />
                              <span>Make Admin</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Admin / User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div className="modal-box" style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                <HiUserPlus style={{ color: '#10B981' }} />
                <span>Create Admin / User</span>
              </h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 20 }}>
                <HiXMark />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              {submitted && Object.keys(errors).length > 0 && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 13,
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <HiExclamationTriangle style={{ fontSize: 18, flexShrink: 0 }} />
                  <span>Please correct the highlighted fields below.</span>
                </div>
              )}

              <div>
                <label className="label" htmlFor="new-user-name">
                  Full Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  id="new-user-name"
                  className={`input${errors.name ? ' error' : ''}`}
                  placeholder="e.g. Priya Sharma"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                />
                {errors.name && (
                  <p className="error-text"><HiExclamationCircle /><span>{errors.name}</span></p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="new-user-email">
                  Email Address <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  id="new-user-email"
                  type="email"
                  className={`input${errors.email ? ' error' : ''}`}
                  placeholder="organizer@example.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                />
                {errors.email && (
                  <p className="error-text"><HiExclamationCircle /><span>{errors.email}</span></p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="new-user-password">
                  Password <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  id="new-user-password"
                  type="password"
                  className={`input${errors.password ? ' error' : ''}`}
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                />
                {errors.password && (
                  <p className="error-text"><HiExclamationCircle /><span>{errors.password}</span></p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label" htmlFor="new-user-phone">Phone (optional)</label>
                  <input
                    id="new-user-phone"
                    className={`input${errors.phone ? ' error' : ''}`}
                    placeholder="+91 9876543210"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  />
                  {errors.phone && (
                    <p className="error-text"><HiExclamationCircle /><span>{errors.phone}</span></p>
                  )}
                </div>

                <div>
                  <label className="label" htmlFor="new-user-role">Assigned Role</label>
                  <select
                    id="new-user-role"
                    className="input"
                    value={form.role}
                    onChange={e => setForm(p => ({ ...p, role: e.target.value as 'ADMIN' | 'CUSTOMER' }))}
                  >
                    <option value="ADMIN">Event Admin</option>
                    <option value="CUSTOMER">Candidate (User)</option>
                  </select>
                </div>
              </div>

              {createMutation.isError && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 13,
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <HiExclamationTriangle style={{ fontSize: 18, flexShrink: 0 }} />
                  <span>
                    {(axios.isAxiosError(createMutation.error) && (createMutation.error.response?.data as { message?: string })?.message) ||
                      'Failed to create user.'}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary btn-md" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating…' : 'Create Account'}
                </button>
                <button type="button" className="btn btn-secondary btn-md" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

