import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect, type ReactNode } from 'react';
import { 
  HiChartBar, 
  HiCalendarDays, 
  HiTag, 
  HiMapPin, 
  HiTicket, 
  HiBolt, 
  HiUser,
  HiArrowRightOnRectangle, 
  HiArrowTopRightOnSquare,
  HiBars3,
  HiXMark
} from 'react-icons/hi2';

interface NavItem {
  to: string;
  icon: React.ReactElement;
  label: string;
}

const sidebarLinks: NavItem[] = [
  { to: '/admin',            icon: <HiChartBar style={{ fontSize: 18 }} />, label: 'Dashboard' },
  { to: '/admin/venues',     icon: <HiMapPin style={{ fontSize: 18 }} />, label: 'Venues' },
  { to: '/admin/events',     icon: <HiCalendarDays style={{ fontSize: 18 }} />, label: 'Events' },
  { to: '/admin/categories', icon: <HiTag style={{ fontSize: 18 }} />, label: 'Categories' },
  { to: '/admin/bookings',   icon: <HiTicket style={{ fontSize: 18 }} />, label: 'Bookings' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => { logout(); navigate('/login'); };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-midnight)', position: 'relative' }}>
      {/* ── Mobile Sidebar Overlay ── */}
      <div
        className={`admin-sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside
        className={`admin-sidebar-drawer ${sidebarOpen ? 'open' : ''}`}
        style={{
          width: 250, flexShrink: 0,
          background: 'var(--bg-deep-navy)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex', flexDirection: 'column',
          position: 'sticky', top: 0, height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
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
          </div>
          {/* Close button on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="show-mobile"
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer', padding: 4 }}
            aria-label="Close Sidebar"
          >
            <HiXMark />
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sidebarLinks.map(({ to, icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`sidebar-link ${isActive(to) ? 'active' : ''}`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          ))}

          <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '14px 0 8px' }} />

          <Link to="/" className="sidebar-link" style={{ color: '#94a3b8' }} onClick={() => setSidebarOpen(false)}>
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
      <div className="admin-main-wrap" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
        {/* Top bar */}
        <header style={{
          minHeight: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 clamp(16px, 3vw, 32px)',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(6, 18, 14, 0.90)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          position: 'sticky', top: 0, zIndex: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="show-mobile"
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                color: '#f8fafc',
                cursor: 'pointer',
                padding: '6px 8px',
                fontSize: 20,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Toggle Admin Navigation"
            >
              <HiBars3 />
            </button>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#f8fafc' }}>
              {sidebarLinks.find(l => isActive(l.to))?.label ?? 'Dashboard'}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }} className="hidden-mobile">
              Welcome, {user?.name?.split(' ')[0]}
            </span>

            {/* Interactive User Avatar Dropdown */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 9999,
                  padding: '4px 14px 4px 5px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: '#0D9488',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#ffffff',
                }}>
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span style={{ fontSize: 13.5, color: '#1E293B', fontWeight: 600 }} className="hidden-mobile">
                  {user?.name || 'Admin'}
                </span>
              </button>

              {userDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  width: 240,
                  background: '#FFFFFF',
                  borderRadius: 14,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                  zIndex: 100,
                  overflow: 'hidden',
                  animation: 'modalPopIn 0.2s ease-out'
                }}>
                  {/* Header with user info */}
                  <div style={{ padding: '16px 18px', borderBottom: '1px solid #F1F5F9' }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                      {user?.name}
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email}
                    </p>
                  </div>

                  {/* Nav Items */}
                  <div style={{ padding: '6px 0' }}>
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 18px',
                        color: '#334155',
                        fontSize: 13.5,
                        fontWeight: 500,
                        textDecoration: 'none',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <HiUser style={{ fontSize: 16, color: '#10B981' }} />
                      <span>Profile</span>
                    </Link>

                    <Link
                      to="/my-bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 18px',
                        color: '#334155',
                        fontSize: 13.5,
                        fontWeight: 500,
                        textDecoration: 'none',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <HiTicket style={{ fontSize: 16, color: '#10B981' }} />
                      <span>My Bookings</span>
                    </Link>

                    <Link
                      to="/"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 18px',
                        color: '#059669',
                        fontSize: 13.5,
                        fontWeight: 600,
                        textDecoration: 'none',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#ECFDF5'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <HiArrowTopRightOnSquare style={{ fontSize: 16, color: '#10B981' }} />
                      <span>Customer View</span>
                    </Link>

                    <div style={{ height: 1, background: '#F1F5F9', margin: '4px 0' }} />

                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 18px',
                        color: '#EF4444',
                        background: 'none',
                        border: 'none',
                        fontSize: 13.5,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        textAlign: 'left'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <HiArrowRightOnRectangle style={{ fontSize: 16, color: '#EF4444' }} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="admin-main-content" style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
