import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';
import { useState, useRef, useEffect } from 'react';
import { 
  HiBolt, 
  HiHome, 
  HiCalendarDays, 
  HiTicket, 
  HiUser, 
  HiArrowRightOnRectangle, 
  HiShieldCheck,
  HiMagnifyingGlass,
  HiSparkles,
  HiChevronDown,
  HiMapPin,
  HiBars3,
  HiXMark
} from 'react-icons/hi2';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { selectedCity, openCityModal, searchQuery, setSearchQuery } = useCity();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
    if (location.pathname !== '/' && location.pathname !== '/events' && !location.pathname.startsWith('/events/')) {
      navigate('/');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    if (location.pathname !== '/' && location.pathname !== '/events') {
      navigate('/');
    }
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      {/* ── MeraEvents-style Clean White Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
      }}>
        <div className="container-app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72, gap: 16 }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #10B981, #0D9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, color: '#ffffff',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}>
              <HiBolt />
            </div>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 23, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Event<span style={{ color: '#10B981' }}>Hub</span>
            </span>
          </Link>

          {/* EventHub Center Search Pill */}
          <form 
            onSubmit={handleSearchSubmit}
            className="hidden-mobile"
            style={{
              flex: '0 1 460px',
              display: 'flex',
              alignItems: 'center',
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: 9999,
              padding: '3px 4px 3px 16px',
              transition: 'border-color 0.2s ease',
              boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
            }}
          >
            <HiSparkles style={{ color: '#10B981', fontSize: 17, marginRight: 8, flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search events near you"
              value={localSearch}
              onChange={e => {
                setLocalSearch(e.target.value);
                setSearchQuery(e.target.value);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#0F172A',
                fontSize: 14,
                width: '100%',
                fontFamily: 'inherit'
              }}
            />
            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 22px',
                borderRadius: 9999,
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#ffffff',
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                transition: 'background 0.2s'
              }}
            >
              <HiMagnifyingGlass style={{ fontSize: 15 }} />
              <span>Search</span>
            </button>
          </form>

          {/* Right: City Selector & Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* City Dropdown Trigger */}
            <button
              type="button"
              id="city-dropdown-btn"
              onClick={openCityModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'none',
                border: 'none',
                color: '#1E293B',
                padding: '6px 8px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'color 0.15s ease',
              }}
              title="Click to change city"
            >
              <span>{selectedCity || 'All Cities'}</span>
              <HiChevronDown style={{ fontSize: 13, color: '#64748B' }} />
            </button>

            {/* Authenticated User Dropdown */}
            {isAuthenticated ? (
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
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span style={{ fontSize: 13.5, color: '#1E293B', fontWeight: 600 }} className="hidden-mobile">
                    {user?.name || 'My Account'}
                  </span>
                </button>

                {/* MeraEvents User Dropdown Card */}
                {userDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '115%',
                    right: 0,
                    width: 240,
                    background: '#FFFFFF',
                    borderRadius: 14,
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
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

                      {isAdmin && (
                        <Link
                          to="/admin"
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
                          <HiShieldCheck style={{ fontSize: 16, color: '#10B981' }} />
                          <span>Admin Portal</span>
                        </Link>
                      )}

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
                          textAlign: 'left'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <HiArrowRightOnRectangle style={{ fontSize: 16 }} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 22px',
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: 13.5,
                  fontWeight: 600,
                  boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
                  transition: 'background 0.2s ease',
                }}
              >
                <span>Login</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', color: '#0F172A', cursor: 'pointer', padding: 6, fontSize: 24 }}
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
            borderTop: '1px solid #E2E8F0',
            background: '#FFFFFF',
            padding: '16px 20px',
            display: 'flex', flexDirection: 'column', gap: 12,
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.08)',
          }}>
            {/* Mobile City Selector */}
            <button
              type="button"
              onClick={() => { setMenuOpen(false); openCityModal(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 10,
                background: '#ECFDF5',
                border: '1.5px solid #A7F3D0',
                color: '#059669',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <HiMapPin style={{ color: '#10B981' }} />
                <span>City: {selectedCity || 'All Cities'}</span>
              </div>
              <span style={{ fontSize: 12, color: '#059669', fontWeight: 700 }}>Change</span>
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {navLinks.map(({ to, label, icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 8,
                    color: isActive(to) ? '#059669' : '#334155',
                    background: isActive(to) ? '#ECFDF5' : 'transparent',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: 14
                  }}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            <div style={{ height: 1, background: '#E2E8F0', margin: '2px 0' }} />

            {/* Mobile Auth Actions */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#0D9488',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: '#ffffff',
                  }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{user?.name}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>{user?.email}</div>
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleLogout}
                  style={{ width: '100%', borderColor: '#E2E8F0', color: '#EF4444' }}
                >
                  <HiArrowRightOnRectangle style={{ fontSize: 15 }} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '10px 20px',
                  borderRadius: 8,
                  background: '#7C3AED',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <span>Login</span>
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* ── Main Page Content ── */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* ── MeraEvents Floating Help Button ── */}
      <button
        type="button"
        onClick={() => alert('EventHub Support: How can we assist you today?')}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: '#10B981',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          cursor: 'pointer',
          zIndex: 90,
          transition: 'transform 0.2s ease',
        }}
        title="Support"
      >
        💬
      </button>

      {/* ── Clean White Footer ── */}
      <footer style={{
        background: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        padding: '32px 16px',
        marginTop: 'auto'
      }}>
        <div className="container-app" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 19, color: '#0F172A' }}>
              Event<span style={{ color: '#10B981' }}>Hub</span>
            </span>
            <span style={{ fontSize: 13, color: '#94A3B8' }}>© 2026 EventHub Inc. All rights reserved.</span>
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#64748B' }}>
            <Link to="/events" style={{ color: 'inherit', textDecoration: 'none' }}>Events</Link>
            <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Sign In</Link>
            <Link to="/register" style={{ color: 'inherit', textDecoration: 'none' }}>Host with Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
