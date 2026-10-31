import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  HiTicket, 
  HiCalendar, 
  HiMapPin, 
  HiArrowRight, 
  HiExclamationTriangle, 
  HiArrowPath,
  HiMagnifyingGlass,
  HiFunnel,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi2';
import { bookingService, type Booking } from '../services/bookingService';
import type { PagedResponse } from '../services/eventService';
import CustomerLayout from '../layouts/CustomerLayout';
import { getEventImage } from '../assets/images';

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All Bookings' },
  { id: 'CONFIRMED', label: 'Confirmed' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

function BookingCard({ booking }: { booking: Booking }) {
  const eventDate = booking.event?.dateTime ? new Date(booking.event.dateTime) : null;
  const bookDate = booking.bookingDate ? new Date(booking.bookingDate) : new Date();

  const statusMap: Record<string, { label: string; cls: string }> = {
    CONFIRMED: { label: 'Confirmed', cls: 'badge-green' },
    CANCELLED: { label: 'Cancelled', cls: 'badge-rose' },
    PENDING:   { label: 'Pending',   cls: 'badge-amber' },
  };
  const s = statusMap[booking.status] ?? { label: booking.status, cls: 'badge-purple' };
  const eventImg = getEventImage(booking.event?.imageUrl, booking.event?.title);

  return (
    <div className="booking-card-item">
      {/* Event Thumb / Icon */}
      <div style={{ width: 84, height: 84, borderRadius: 14, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
        <img src={eventImg} alt={booking.event?.title ?? 'Event'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(124, 58, 237, 0.15)' }} />
      </div>

      {/* Info Body */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1e1b4b' }}>
            {booking.event?.title ?? 'Event Booking'}
          </h3>
          <span className={`badge ${s.cls}`}>{s.label}</span>
        </div>

        {eventDate && !isNaN(eventDate.getTime()) && (
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <HiCalendar style={{ color: '#7c3aed', flexShrink: 0 }} />
            <span>
              {eventDate.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })} · {eventDate.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
            </span>
          </p>
        )}

        {booking.event?.venue && (
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <HiMapPin style={{ color: '#e11d48', flexShrink: 0 }} />
            <span>{booking.event.venue.name}{booking.event.venue.city ? `, ${booking.event.venue.city}` : ''}</span>
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 5 }}>
              <HiTicket style={{ color: '#a855f7' }} />
              {booking.ticketCount} ticket{booking.ticketCount > 1 ? 's' : ''}
            </span>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#059669' }}>
              {booking.totalAmount === 0 ? 'Free' : `₹${booking.totalAmount?.toLocaleString('en-IN')}`}
            </span>
          </div>

          <Link to={`/my-bookings/${booking.id}`} className="btn btn-secondary btn-sm">
            <span>View Details</span>
            <HiArrowRight style={{ fontSize: 14 }} />
          </Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid #f3f0ff', fontSize: 11, color: '#6b7280' }}>
          <span>Ref: <strong style={{ color: '#7c3aed' }}>#EH{String(booking.id).padStart(6, '0')}</strong></span>
          <span>Booked on {!isNaN(bookDate.getTime()) ? bookDate.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : 'Recently'}</span>
        </div>
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingService.getMyBookings(),
  });

  const raw = data?.data;
  const allBookings: Booking[] = useMemo(() => {
    if (Array.isArray(raw)) {
      return raw;
    }
    if (raw && typeof raw === 'object' && 'content' in raw && Array.isArray((raw as PagedResponse<Booking>).content)) {
      return (raw as PagedResponse<Booking>).content;
    }
    return [];
  }, [raw]);

  // Filtering
  const filteredBookings = useMemo(() => {
    return allBookings.filter(b => {
      // Status filter
      if (selectedStatus !== 'ALL' && b.status !== selectedStatus) {
        return false;
      }
      // Search filter (by title, venue, or ref ID)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const titleMatch = b.event?.title?.toLowerCase().includes(query);
        const venueMatch = b.event?.venue?.name?.toLowerCase().includes(query) || b.event?.venue?.city?.toLowerCase().includes(query);
        const refMatch = String(b.id).includes(query) || `#EH${String(b.id).padStart(6, '0')}`.toLowerCase().includes(query);
        if (!titleMatch && !venueMatch && !refMatch) return false;
      }
      return true;
    });
  }, [allBookings, selectedStatus, searchTerm]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredBookings.length / pageSize) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  return (
    <CustomerLayout>
      <div className="container-app page-container" style={{ maxWidth: 860 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="booking-icon-box">
                <HiTicket />
              </div>
              <span>My Bookings</span>
            </h1>
            <p style={{ color: '#6b7280', fontSize: 15, marginTop: 4 }}>
              {isLoading ? 'Loading your reservations…' : `Showing ${filteredBookings.length} of ${allBookings.length} total bookings`}
            </p>
          </div>

          <button onClick={() => refetch()} className="btn btn-secondary btn-sm">
            <HiArrowPath style={{ fontSize: 14 }} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="filter-card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 260px' }}>
              <input
                type="text"
                className="input"
                placeholder="Search booking title or ref #…"
                value={searchTerm}
                onChange={e => handleSearchChange(e.target.value)}
                style={{ paddingLeft: 38 }}
              />
              <HiMagnifyingGlass style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 18 }} />
            </div>

            {/* Status Chips */}
            <div className="filter-chips-row" style={{ margin: 0 }}>
              {STATUS_FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => handleStatusChange(f.id)}
                  className={`filter-chip ${selectedStatus === f.id ? 'active' : ''}`}
                >
                  <HiFunnel style={{ fontSize: 13 }} />
                  <span>{f.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Booking List / States */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div className="spinner" style={{ width: 44, height: 44 }} />
          </div>
        ) : isError ? (
          <div className="state-box" style={{ background: '#fff1f2', borderColor: '#fecdd3' }}>
            <div style={{ fontSize: 44, color: '#e11d48', marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
              <HiExclamationTriangle />
            </div>
            <h3 style={{ color: '#be123c', fontWeight: 700, marginBottom: 6 }}>Failed to load bookings</h3>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>
              {axios.isAxiosError(error)
                ? (error.response?.data?.message || error.message)
                : error instanceof Error
                ? error.message
                : 'Please check backend server connection.'}
            </p>
            <button onClick={() => refetch()} className="btn btn-primary btn-sm">Try Again</button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="state-box">
            <div className="state-icon">
              <HiTicket />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e1b4b', marginBottom: 8 }}>
              {allBookings.length === 0 ? 'No bookings yet' : 'No matching bookings found'}
            </h3>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
              {allBookings.length === 0
                ? "You haven't reserved tickets for any events. Start exploring now!"
                : 'Try clearing your search term or selecting a different status filter.'}
            </p>
            {allBookings.length === 0 ? (
              <Link to="/events" className="btn btn-primary btn-md">
                <span>Browse Events</span>
                <HiArrowRight />
              </Link>
            ) : (
              <button onClick={() => { setSearchTerm(''); setSelectedStatus('ALL'); }} className="btn btn-secondary btn-sm">
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {paginatedBookings.map(b => (
                <BookingCard key={b.id} booking={b} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  <HiChevronLeft />
                  <span>Prev</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${pageNum === currentPage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  className="pagination-btn"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  <span>Next</span>
                  <HiChevronRight />
                </button>

                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </CustomerLayout>
  );
}
