import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { 
  HiBolt, 
  HiHome, 
  HiCalendarDays, 
  HiTicket, 
  HiUser, 
  HiArrowRightOnRectangle, 
  HiArrowRightEndOnRectangle, 
  HiUserPlus, 
  HiBars3, 
  HiXMark,
  HiShieldCheck
} from 'react-icons/hi2';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/',            label: 'Home',        icon: <HiHome style={{ fontSize: 16 }} /> },
    { to: '/events',      label: 'Events',      icon: <HiCalendarDays style={{ fontSize: 16 }} /> },
    ...(isAuthenticated ? [
      { to: '/my-bookings', label: 'My Bookings', icon: <HiTicket style={{ fontSize: 16 }} /> },
      { to: '/profile',     label: 'Profile',     icon: <HiUser style={{ fontSize: 16 }} /> },
    ] : []),
    ...(isAdmin ? [
      { to: '/admin',       label: 'Admin Panel', icon: <HiShieldCheck style={{ fontSize: 16 }} /> },
    ] : []),
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#faf8ff' }}>
      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #ede9fe',
        boxShadow: '0 1px 3px rgba(30, 27, 75, 0.04)',
      }}>
        <div className="container-app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, color: '#ffffff',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
            }}>
              <HiBolt />
            </div>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 21, color: '#1e1b4b' }}>
              Event<span className="gradient-text">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="hidden-mobile">
            {navLinks.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link ${isActive(to) ? 'active' : ''}`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Auth Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isAuthenticated ? (
              <>
                <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: '#ffffff',
                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                  }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, color: '#4b5563', fontWeight: 600 }} className="hidden-mobile">
                    {user?.name?.split(' ')[0]}
                  </span>
                </Link>
                <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                  <HiArrowRightOnRectangle style={{ fontSize: 15 }} />
                  <span className="hidden-mobile">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  <HiArrowRightEndOnRectangle style={{ fontSize: 15 }} />
                  <span>Login</span>
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  <HiUserPlus style={{ fontSize: 15 }} />
                  <span>Sign Up</span>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', padding: 6, fontSize: 22 }}
              className="show-mobile"
              aria-label="Toggle Navigation"
            >
              {menuOpen ? <HiXMark /> : <HiBars3 />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{ borderTop: '1px solid #ede9fe', background: '#ffffff', padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {navLinks.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`nav-link ${isActive(to) ? 'active' : ''}`}
                style={{ width: '100%' }}
              >
                {icon}
                <span>{label}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* ── Page Content ── */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid #ede9fe',
        background: '#ffffff',
        padding: '36px 24px',
        textAlign: 'center',
      }}>
        <div className="container-app">
          <p style={{ fontSize: 14, color: '#6b7280' }}>
            © 2026 <span style={{ color: '#7c3aed', fontWeight: 700 }}>EventHub</span> — Modern Event Management &amp; Ticketing Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
