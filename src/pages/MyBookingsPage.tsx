import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  HiTicket, 
  HiMagnifyingGlass, 
  HiArrowDownTray,
  HiPaperAirplane,
  HiShare,
  HiEye,
  HiSquares2X2,
  HiListBullet,
  HiCalendarDays,
  HiArrowRight
} from 'react-icons/hi2';
import { bookingService, type Booking } from '../services/bookingService';
import AccountLayout from '../layouts/AccountLayout';
import { getEventImage, getCategoryFallback } from '../assets/images';

type TabType = 'ONGOING' | 'NEEDS_ACTION' | 'PAST' | 'ALL';

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ONGOING');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingService.getMyBookings(),
  });

  const bookings: Booking[] = useMemo(() => data?.data ?? [], [data?.data]);

  const now = new Date();

  // Filter bookings based on activeTab and searchQuery
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const title = b.event?.title?.toLowerCase() ?? '';
      const regNo = `#EH${String(b.id).padStart(6, '0')}`.toLowerCase();
      const matchesSearch = !q || title.includes(q) || regNo.includes(q);
      if (!matchesSearch) return false;

      const eventDate = b.event?.dateTime ? new Date(b.event.dateTime) : null;

      if (activeTab === 'ONGOING') {
        // Event date is in future or today, and not cancelled
        return b.status !== 'CANCELLED' && (!eventDate || eventDate >= now);
      }
      if (activeTab === 'NEEDS_ACTION') {
        return b.status === 'PENDING';
      }
      if (activeTab === 'PAST') {
        return b.status === 'CANCELLED' || (eventDate && eventDate < now);
      }
      return true; // 'ALL'
    });
  }, [bookings, activeTab, searchQuery, now]);

  const handleDownloadTicket = (b: Booking) => {
    alert(`Downloading e-Ticket for registration #301${String(b.id).padStart(4, '0')} (${b.event?.title})`);
  };

  const handleShareBooking = (b: Booking) => {
    if (navigator.share) {
      navigator.share({
        title: b.event?.title,
        text: `I'm attending ${b.event?.title}!`,
        url: window.location.origin + `/events/${b.event?.id}`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin + `/events/${b.event?.id}`);
      alert('Event link copied to clipboard!');
    }
  };

  return (
    <AccountLayout activeTab="bookings">
      {/* ── Page Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
          My Bookings
        </h1>
        <p style={{ fontSize: 13.5, color: '#64748B' }}>
          Your purchased tickets and registrations.
        </p>
      </div>

      {/* ── Controls Row (Tabs + Search + View toggle) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 20
      }}>
        {/* Filter Tabs (Ongoing & upcoming, Needs action, Past, All) */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: '#F1F5F9',
          padding: '4px',
          borderRadius: 9999,
          gap: 4
        }}>
          {[
            { id: 'ONGOING', label: 'Ongoing & upcoming' },
            { id: 'NEEDS_ACTION', label: 'Needs action' },
            { id: 'PAST', label: 'Past' },
            { id: 'ALL', label: 'All' },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 9999,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  background: isActive ? '#FFFFFF' : 'transparent',
                  color: isActive ? '#0F172A' : '#64748B',
                  boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right: Search + View Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Search bookings */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 8,
            padding: '7px 12px',
            width: 220
          }}>
            <HiMagnifyingGlass style={{ color: '#94A3B8', fontSize: 16, marginRight: 8, flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search bookings"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 13,
                color: '#0F172A',
                width: '100%'
              }}
            />
          </div>

          {/* Grid/List switch */}
          <div style={{
            display: 'inline-flex',
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 8,
            padding: 2
          }}>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? '#F1F5F9' : 'transparent',
                color: viewMode === 'grid' ? '#0F172A' : '#94A3B8',
                border: 'none',
                borderRadius: 6,
                padding: '6px 8px',
                cursor: 'pointer',
                display: 'flex'
              }}
              title="Grid view"
            >
              <HiSquares2X2 style={{ fontSize: 16 }} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? '#F1F5F9' : 'transparent',
                color: viewMode === 'list' ? '#0F172A' : '#94A3B8',
                border: 'none',
                borderRadius: 6,
                padding: '6px 8px',
                cursor: 'pointer',
                display: 'flex'
              }}
              title="Table / List view"
            >
              <HiListBullet style={{ fontSize: 16 }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content View ── */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : isError ? (
        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          padding: 40,
          textAlign: 'center'
        }}>
          <p style={{ color: '#EF4444', fontSize: 15, marginBottom: 16 }}>Failed to load bookings</p>
          <button
            onClick={() => refetch()}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: 'none',
              background: '#10B981',
              color: '#FFFFFF',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      ) : filteredBookings.length === 0 ? (
        /* Empty State */
        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          padding: '60px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: '#ECFDF5',
            color: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 28
          }}>
            <HiTicket />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
            No bookings found
          </h3>
          <p style={{ fontSize: 13.5, color: '#64748B', maxWidth: 380, margin: '0 auto 20px' }}>
            {searchQuery
              ? `No bookings match "${searchQuery}". Try a different keyword.`
              : 'You do not have any bookings in this tab yet. Explore trending events and get your tickets!'}
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 24px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: 13.5,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
            }}
          >
            <span>Explore Events</span>
            <HiArrowRight style={{ fontSize: 14 }} />
          </Link>
        </div>
      ) : viewMode === 'list' ? (
        /* ── MeraEvents Bookings Table (Matching Image 8) ── */
        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          overflowX: 'auto',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 840 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Event</th>
                <th style={{ padding: '14px 16px', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Event date</th>
                <th style={{ padding: '14px 16px', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Venue</th>
                <th style={{ padding: '14px 16px', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Booked on</th>
                <th style={{ padding: '14px 12px', fontSize: 12, fontWeight: 600, color: '#64748B', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '14px 16px', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Reg no.</th>
                <th style={{ padding: '14px 16px', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Status</th>
                <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#64748B', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => {
                const eventDate = b.event?.dateTime ? new Date(b.event.dateTime) : null;
                const bookDate = b.bookingDate ? new Date(b.bookingDate) : new Date();
                const regNo = `#301${String(b.id).padStart(4, '0')}`;
                const isFree = b.totalAmount === 0;

                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid #F8FAFC', transition: 'background 0.15s' }}>
                    {/* Event thumbnail + title */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 300 }}>
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: 8,
                          overflow: 'hidden',
                          flexShrink: 0,
                          background: '#0F172A'
                        }}>
                          <img
                            src={getEventImage(b.event?.imageUrl, b.event?.title)}
                            alt={b.event?.title ?? 'Event'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = getCategoryFallback(b.event?.title);
                            }}
                          />
                        </div>
                        <Link
                          to={`/events/${b.event?.id}`}
                          style={{
                            fontSize: 13.5,
                            fontWeight: 700,
                            color: '#0F172A',
                            textDecoration: 'none',
                            lineHeight: 1.35,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {b.event?.title ?? 'Event Booking'}
                        </Link>
                      </div>
                    </td>

                    {/* Event date */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      {eventDate ? (
                        <>
                          <p style={{ fontSize: 13, color: '#0F172A', fontWeight: 500, marginBottom: 2 }}>
                            {eventDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <p style={{ fontSize: 11.5, color: '#64748B' }}>
                            {eventDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </>
                      ) : (
                        <span style={{ fontSize: 13, color: '#94A3B8' }}>—</span>
                      )}
                    </td>

                    {/* Venue */}
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#475569', maxWidth: 160 }}>
                      <span style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {b.event?.venue?.name || '—'}
                      </span>
                    </td>

                    {/* Booked on */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <p style={{ fontSize: 13, color: '#0F172A', fontWeight: 500, marginBottom: 2 }}>
                        {bookDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p style={{ fontSize: 11.5, color: '#64748B' }}>
                        {bookDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>

                    {/* Qty */}
                    <td style={{ padding: '14px 12px', fontSize: 13.5, fontWeight: 600, color: '#0F172A', textAlign: 'center' }}>
                      {b.ticketCount}
                    </td>

                    {/* Reg no */}
                    <td style={{ padding: '14px 16px', fontSize: 12.5, color: '#475569', fontFamily: 'monospace' }}>
                      {regNo}
                    </td>

                    {/* Status Pill */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '3px 10px',
                        borderRadius: 9999,
                        fontSize: 12,
                        fontWeight: 600,
                        background: b.status === 'CANCELLED' ? '#FEF2F2' : '#ECFDF5',
                        color: b.status === 'CANCELLED' ? '#DC2626' : '#059669',
                        border: `1px solid ${b.status === 'CANCELLED' ? '#FECACA' : '#A7F3D0'}`
                      }}>
                        <span style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: b.status === 'CANCELLED' ? '#DC2626' : '#10B981'
                        }} />
                        <span>{isFree ? 'Free' : b.status === 'CONFIRMED' ? 'Confirmed' : b.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => handleDownloadTicket(b)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748B',
                            padding: 6,
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Download ticket"
                        >
                          <HiArrowDownTray style={{ fontSize: 16 }} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShareBooking(b)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748B',
                            padding: 6,
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Share event"
                        >
                          <HiPaperAirplane style={{ fontSize: 15 }} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShareBooking(b)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748B',
                            padding: 6,
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Share link"
                        >
                          <HiShare style={{ fontSize: 15 }} />
                        </button>

                        <Link
                          to={`/my-bookings/${b.id}`}
                          style={{
                            color: '#10B981',
                            padding: 6,
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="View booking details"
                        >
                          <HiEye style={{ fontSize: 16 }} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── Grid View ── */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20
        }}>
          {filteredBookings.map(b => {
            const eventDate = b.event?.dateTime ? new Date(b.event.dateTime) : null;
            return (
              <div
                key={b.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 14,
                  border: '1px solid #E2E8F0',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}
              >
                <div style={{ height: 140, borderRadius: 10, overflow: 'hidden' }}>
                  <img
                    src={getEventImage(b.event?.imageUrl, b.event?.title)}
                    alt={b.event?.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>
                  {b.event?.title}
                </h3>
                {eventDate && (
                  <p style={{ fontSize: 12.5, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <HiCalendarDays style={{ color: '#10B981', fontSize: 16 }} />
                    <span>{eventDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: 12, color: '#64748B' }}>Qty: <strong>{b.ticketCount}</strong></span>
                  <Link to={`/my-bookings/${b.id}`} style={{ fontSize: 12.5, fontWeight: 600, color: '#10B981', textDecoration: 'none' }}>
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AccountLayout>
  );
}
