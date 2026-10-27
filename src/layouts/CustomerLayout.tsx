import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/',        label: 'Home' },
    { to: '/events',  label: 'Events' },
    ...(isAuthenticated ? [
      { to: '/my-bookings', label: 'My Bookings' },
      { to: '/profile',     label: 'Profile' },
    ] : []),
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,10,26,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="container-app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 800,
            }}>⚡</div>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 20, color: '#e2e8f0' }}>
              Event<span className="gradient-text">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden-mobile">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} style={{
                padding: '7px 16px', borderRadius: 8, textDecoration: 'none',
                fontSize: 14, fontWeight: 500,
                color: isActive(to) ? '#a78bfa' : '#94a3b8',
                background: isActive(to) ? 'rgba(139,92,246,0.12)' : 'transparent',
                transition: 'all 0.2s',
              }}>
                {label}
              </Link>
            ))}
          </div>

          {/* Auth Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isAuthenticated ? (
              <>
                <span style={{ fontSize: 13, color: '#64748b' }}>Hi, {user?.name?.split(' ')[0]}</span>
                <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
              </>
            )}
            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4, display: 'none' }}
              className="show-mobile"
            >☰</button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{
                padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
                fontSize: 14, fontWeight: 500,
                color: isActive(to) ? '#a78bfa' : '#94a3b8',
              }}>{label}</Link>
            ))}
          </div>
        )}
      </nav>

      {/* ── Page Content ── */}
      <main style={{ flex: 1 }} className="page-enter">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '32px 24px',
        textAlign: 'center',
      }}>
        <div className="container-app">
          <p style={{ fontSize: 13, color: '#475569' }}>
            © 2026 <span style={{ color: '#7c3aed' }}>EventHub</span> — Event Management & Booking Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
