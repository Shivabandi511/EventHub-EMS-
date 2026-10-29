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
    <div style={{ minHeight: '100vh', display: 'flex', background: '#faf8ff' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 250, flexShrink: 0,
        background: '#ffffff',
        borderRight: '1px solid #ede9fe',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid #ede9fe' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: '#ffffff',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
            }}>
              <HiBolt />
            </div>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 19, color: '#1e1b4b' }}>
              Event<span className="gradient-text">Hub</span>
            </span>
          </Link>
          <div style={{
            marginTop: 10, padding: '4px 8px', borderRadius: 6,
            background: '#f3e8ff', border: '1px solid #e9d5ff', display: 'inline-block',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.5px' }}>ADMIN CONSOLE</span>
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

          <div style={{ borderTop: '1px solid #ede9fe', margin: '14px 0 8px' }} />

          <Link to="/" className="sidebar-link" style={{ color: '#6b7280' }}>
            <HiArrowTopRightOnSquare style={{ fontSize: 18 }} />
            <span>Customer View</span>
          </Link>
        </nav>

        {/* User info + logout */}
        <div style={{ padding: '16px 14px', borderTop: '1px solid #ede9fe' }}>
          <div style={{ padding: '12px 14px', borderRadius: 10, background: '#faf8ff', border: '1px solid #ede9fe', marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b' }}>{user?.name}</p>
            <p style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{user?.email}</p>
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
          borderBottom: '1px solid #ede9fe',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          position: 'sticky', top: 0, zIndex: 40,
        }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#1e1b4b' }}>
            {sidebarLinks.find(l => isActive(l.to))?.label ?? 'Dashboard'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>Welcome, {user?.name?.split(' ')[0]}</span>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: 'white',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
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
