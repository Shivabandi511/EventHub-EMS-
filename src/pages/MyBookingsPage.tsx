import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bookingService, type Booking } from '../services/bookingService';
import CustomerLayout from '../layouts/CustomerLayout';

function BookingCard({ booking }: { booking: Booking }) {
  const date       = new Date(booking.event?.dateTime);
  const bookDate   = new Date(booking.bookingDate);
  const statusMap  = {
    CONFIRMED: { label: 'Confirmed', cls: 'badge-green' },
    CANCELLED: { label: 'Cancelled', cls: 'badge-red' },
    PENDING:   { label: 'Pending',   cls: 'badge-yellow' },
  };
  const s = statusMap[booking.status] ?? { label: booking.status, cls: 'badge-purple' };

  return (
    <div className="glass-card" style={{ padding: 22, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      {/* Icon */}
      <div style={{
        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
        background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, color: '#ffffff',
      }}>🎟️</div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            {booking.event?.title}
          </h3>
          <span className={`badge ${s.cls}`}>{s.label}</span>
        </div>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 3 }}>
          📅 {date.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })} · {date.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
        </p>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
          📍 {booking.event?.venue?.name}, {booking.event?.venue?.city}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ fontSize: 13, color: '#475569' }}>
              🎫 {booking.ticketCount} ticket{booking.ticketCount > 1 ? 's' : ''}
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#2563eb' }}>
              {booking.totalAmount === 0 ? 'Free' : `₹${booking.totalAmount.toLocaleString('en-IN')}`}
            </span>
          </div>
          <Link to={`/my-bookings/${booking.id}`} className="btn btn-secondary btn-sm">View Details →</Link>
        </div>
        <p style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>
          Booked on {bookDate.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
          &nbsp;·&nbsp;Ref: #EH{String(booking.id).padStart(6, '0')}
        </p>
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingService.getMyBookings(),
  });

  const bookings = data?.data ?? [];

  return (
    <CustomerLayout>
      <div className="container-app" style={{ padding: '40px 24px', maxWidth: 820 }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
          My Bookings
        </h1>
        <p style={{ color: '#64748b', fontSize: 15, marginBottom: 32 }}>
          {isLoading ? 'Loading…' : `${bookings.length} booking${bookings.length !== 1 ? 's' : ''}`}
        </p>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div className="spinner" style={{ width: 44, height: 44 }} />
          </div>
        ) : isError ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fef2f2', borderRadius: 16, border: '1px dashed #fecaca' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <p style={{ color: '#b91c1c' }}>Failed to load bookings. Check backend connection.</p>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, background: '#ffffff', borderRadius: 16, border: '1px dashed #cbd5e1' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎟️</div>
            <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 22, color: '#0f172a', marginBottom: 10 }}>No bookings yet</h3>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>You haven't booked any events. Start exploring!</p>
            <Link to="/events" className="btn btn-primary btn-lg">Browse Events →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {bookings.map(b => <BookingCard key={b.id} booking={b} />)}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
