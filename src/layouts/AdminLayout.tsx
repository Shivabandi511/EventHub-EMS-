import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

const sidebarLinks = [
  { to: '/admin',           icon: '📊', label: 'Dashboard' },
  { to: '/admin/events',    icon: '🎭', label: 'Events' },
  { to: '/admin/categories',icon: '🏷️', label: 'Categories' },
  { to: '/admin/venues',    icon: '📍', label: 'Venues' },
  { to: '/admin/bookings',  icon: '🎟️', label: 'Bookings' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid #e2e8f0' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: '#ffffff',
            }}>⚡</div>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 18, color: '#0f172a' }}>
              Event<span className="gradient-text">Hub</span>
            </span>
          </Link>
          <div style={{
            marginTop: 10, padding: '4px 8px', borderRadius: 6,
            background: '#eff6ff', border: '1px solid #bfdbfe', display: 'inline-block',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', letterSpacing: '0.5px' }}>ADMIN PANEL</span>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sidebarLinks.map(({ to, icon, label }) => (
            <Link key={to} to={to} className={`sidebar-link${isActive(to) ? ' active' : ''}`}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* User info + logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ padding: '10px 12px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 10 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{user?.name}</p>
            <p style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{user?.email}</p>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {/* Top bar */}
        <header style={{
          height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px',
          borderBottom: '1px solid #e2e8f0',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          position: 'sticky', top: 0, zIndex: 40,
        }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
            {sidebarLinks.find(l => isActive(l.to))?.label ?? 'Dashboard'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Welcome, {user?.name?.split(' ')[0]}</span>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: 'white',
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: 28 }} className="page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
