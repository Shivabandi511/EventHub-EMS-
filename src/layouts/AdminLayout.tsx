import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';
import { 
  HiChartBar, 
  HiCalendarDays, 
  HiTag, 
  HiMapPin, 
  HiTicket, 
  HiBolt, 
  HiArrowRightOnRectangle, 
  HiArrowTopRightOnSquare 
} from 'react-icons/hi2';

interface NavItem {
  to: string;
  icon: React.ReactElement;
  label: string;
}

const sidebarLinks: NavItem[] = [
  { to: '/admin',            icon: <HiChartBar style={{ fontSize: 18 }} />, label: 'Dashboard' },
  { to: '/admin/events',     icon: <HiCalendarDays style={{ fontSize: 18 }} />, label: 'Events' },
  { to: '/admin/categories', icon: <HiTag style={{ fontSize: 18 }} />, label: 'Categories' },
  { to: '/admin/venues',     icon: <HiMapPin style={{ fontSize: 18 }} />, label: 'Venues' },
  { to: '/admin/bookings',   icon: <HiTicket style={{ fontSize: 18 }} />, label: 'Bookings' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-midnight)' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 250, flexShrink: 0,
        background: 'var(--bg-deep-navy)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #10b981, #0d9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: '#ffffff',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.5)',
            }}>
              <HiBolt />
            </div>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 19, color: '#f8fafc' }}>
              Event<span className="gradient-text">Hub</span>
            </span>
          </Link>
          <div style={{
            marginTop: 10, padding: '4px 10px', borderRadius: 6,
            background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', display: 'inline-block',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', letterSpacing: '0.5px' }}>ADMIN CONSOLE</span>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sidebarLinks.map(({ to, icon, label }) => (
            <Link key={to} to={to} className={`sidebar-link ${isActive(to) ? 'active' : ''}`}>
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          ))}

          <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '14px 0 8px' }} />

          <Link to="/" className="sidebar-link" style={{ color: '#94a3b8' }}>
            <HiArrowTopRightOnSquare style={{ fontSize: 18 }} />
            <span>Customer View</span>
          </Link>
        </nav>

        {/* User info + logout */}
        <div style={{ padding: '16px 14px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-midnight)', border: '1px solid var(--border-subtle)', marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>{user?.name}</p>
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{user?.email}</p>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={handleLogout}>
            <HiArrowRightOnRectangle style={{ fontSize: 16 }} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {/* Top bar */}
        <header style={{
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(11, 16, 32, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          position: 'sticky', top: 0, zIndex: 40,
        }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#f8fafc' }}>
            {sidebarLinks.find(l => isActive(l.to))?.label ?? 'Dashboard'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Welcome, {user?.name?.split(' ')[0]}</span>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #34d399)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: 'white',
              boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)',
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: 32 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
