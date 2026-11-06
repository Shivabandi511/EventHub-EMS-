import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HiBolt, 
  HiUser, 
  HiTicket, 
  HiArrowRightOnRectangle, 
  HiChevronDown,
  HiArrowLeft,
  HiBars3BottomLeft
} from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';

interface AccountLayoutProps {
  children: ReactNode;
  activeTab: 'basic-info' | 'bookings';
}

export default function AccountLayout({ children, activeTab }: AccountLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/');
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F8FAFC', color: '#0F172A' }}>
      {/* ── Left Sidebar (Matching MeraEvents Profile/Bookings sidebar) ── */}
      <aside style={{
        width: sidebarOpen ? 250 : 0,
        transition: 'width 0.25s ease',
        background: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
        zIndex: 40,
        flexShrink: 0
      }}>
        {/* Logo header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #10B981, #0D9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 19, color: '#ffffff',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}>
              <HiBolt />
            </div>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 21, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Event<span style={{ color: '#10B981' }}>Hub</span>
            </span>
          </Link>
        </div>

        {/* Navigation list */}
        <div style={{ padding: '24px 16px', flex: 1 }}>
          <p style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#94A3B8',
            marginBottom: 12,
            paddingLeft: 12,
            letterSpacing: '0.02em'
          }}>
            Personal Info
          </p>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* Basic Info Pill */}
            <Link
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 10,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                transition: 'all 0.15s ease',
                background: activeTab === 'basic-info' ? '#ECFDF5' : 'transparent',
                color: activeTab === 'basic-info' ? '#059669' : '#475569',
                borderLeft: activeTab === 'basic-info' ? '3px solid #10B981' : '3px solid transparent'
              }}
            >
              <HiUser style={{ fontSize: 18, color: activeTab === 'basic-info' ? '#10B981' : '#64748B' }} />
              <span>Basic Info</span>
            </Link>

            {/* Bookings Pill */}
            <Link
              to="/my-bookings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 10,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                transition: 'all 0.15s ease',
                background: activeTab === 'bookings' ? '#ECFDF5' : 'transparent',
                color: activeTab === 'bookings' ? '#059669' : '#475569',
                borderLeft: activeTab === 'bookings' ? '3px solid #10B981' : '3px solid transparent'
              }}
            >
              <HiTicket style={{ fontSize: 18, color: activeTab === 'bookings' ? '#10B981' : '#64748B' }} />
              <span>Bookings</span>
            </Link>
          </nav>
        </div>

        {/* Back to Home / Events */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #F1F5F9' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: '#64748B',
              textDecoration: 'none',
              fontWeight: 500,
              padding: '6px 0'
            }}
          >
            <HiArrowLeft style={{ fontSize: 14 }} />
            <span>Back to Events</span>
          </Link>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header bar */}
        <header style={{
          height: 64,
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          {/* Left: Sidebar toggle */}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 8,
              transition: 'background 0.15s'
            }}
            title="Toggle sidebar"
          >
            <HiBars3BottomLeft style={{ fontSize: 22 }} />
          </button>

          {/* Right: User Avatar Pill */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
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
                width: 32, height: 32, borderRadius: '50%',
                background: '#0D9488',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#ffffff',
              }}>
                {initial}
              </div>
              <span style={{ fontSize: 14, color: '#1E293B', fontWeight: 600 }}>
                {user?.name || 'User'}
              </span>
              <HiChevronDown style={{ fontSize: 13, color: '#64748B' }} />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: 250,
                background: '#FFFFFF',
                borderRadius: 14,
                border: '1px solid #E2E8F0',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                zIndex: 100,
                overflow: 'hidden'
              }}>
                <div style={{ padding: '16px 18px', borderBottom: '1px solid #F1F5F9', background: '#FAFAFA' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>{user?.name}</p>
                  <p style={{ fontSize: 12, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                </div>
                <div style={{ padding: '8px' }}>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 8,
                      fontSize: 13.5,
                      fontWeight: 500,
                      color: location.pathname === '/profile' ? '#059669' : '#334155',
                      textDecoration: 'none',
                      background: location.pathname === '/profile' ? '#ECFDF5' : 'transparent',
                    }}
                  >
                    <HiUser style={{ fontSize: 16, color: location.pathname === '/profile' ? '#10B981' : '#64748B' }} />
                    <span>Profile</span>
                  </Link>

                  <Link
                    to="/my-bookings"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 8,
                      fontSize: 13.5,
                      fontWeight: 500,
                      color: location.pathname === '/my-bookings' ? '#059669' : '#334155',
                      textDecoration: 'none',
                      background: location.pathname === '/my-bookings' ? '#ECFDF5' : 'transparent',
                    }}
                  >
                    <HiTicket style={{ fontSize: 16, color: location.pathname === '/my-bookings' ? '#10B981' : '#64748B' }} />
                    <span>My Bookings</span>
                  </Link>

                  <div style={{ height: 1, background: '#F1F5F9', margin: '6px 0' }} />

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 8,
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: '#E11D48',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <HiArrowRightOnRectangle style={{ fontSize: 16 }} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Children content area */}
        <main style={{ flex: 1, padding: '32px 36px', maxWidth: 1100, width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
