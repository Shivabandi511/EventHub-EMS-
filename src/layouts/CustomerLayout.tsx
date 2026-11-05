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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-midnight)' }}>
      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(6, 18, 14, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
      }}>
        <div className="container-app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'linear-gradient(135deg, #10b981, #0d9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, color: '#ffffff',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.5)',
            }}>
              <HiBolt />
            </div>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 21, color: '#f8fafc' }}>
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
                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: '#ffffff',
                    boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)',
                  }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, color: '#f8fafc', fontWeight: 600 }} className="hidden-mobile">
                    {user?.name?.split(' ')[0]}
                  </span>
                </Link>
                <button className="btn btn-secondary btn-sm hidden-mobile" onClick={handleLogout}>
                  <HiArrowRightOnRectangle style={{ fontSize: 15 }} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  <HiArrowRightEndOnRectangle style={{ fontSize: 15 }} />
                  <span>Login</span>
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  <HiUserPlus style={{ fontSize: 15 }} />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', color: '#f8fafc', cursor: 'pointer', padding: 6, fontSize: 24 }}
              className="show-mobile"
              aria-label="Toggle Navigation"
            >
              {menuOpen ? <HiXMark /> : <HiBars3 />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(13, 30, 24, 0.98)',
            backdropFilter: 'blur(20px)',
            padding: '16px 20px',
            display: 'flex', flexDirection: 'column', gap: 12,
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {navLinks.map(({ to, label, icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`nav-link ${isActive(to) ? 'active' : ''}`}
                  style={{ width: '100%', padding: '10px 14px' }}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            <div style={{ height: 1, background: 'var(--border-subtle)', margin: '2px 0' }} />

            {/* Mobile Auth Actions */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: '#ffffff',
                  }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>{user?.name}</span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{user?.email}</span>
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                >
                  <HiArrowRightOnRectangle style={{ fontSize: 15 }} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="btn btn-secondary btn-md"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <HiArrowRightEndOnRectangle style={{ fontSize: 15 }} />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="btn btn-primary btn-md"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <HiUserPlus style={{ fontSize: 15 }} />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* ── Page Content ── */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-midnight)',
        padding: '36px 24px',
        textAlign: 'center',
      }}>
        <div className="container-app">
          <p style={{ fontSize: 14, color: '#94a3b8' }}>
            © 2026 <span style={{ color: '#34d399', fontWeight: 700 }}>EventHub</span> — Modern Event Management &amp; Ticketing Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
