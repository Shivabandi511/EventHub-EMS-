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
        background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22,
      }}>🎟️</div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>
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
            <span style={{ fontSize: 13, color: '#94a3b8' }}>
              🎫 {booking.ticketCount} ticket{booking.ticketCount > 1 ? 's' : ''}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa' }}>
              {booking.totalAmount === 0 ? 'Free' : `₹${booking.totalAmount.toLocaleString('en-IN')}`}
            </span>
          </div>
          <Link to={`/my-bookings/${booking.id}`} className="btn btn-secondary btn-sm">View Details →</Link>
        </div>
        <p style={{ fontSize: 11, color: '#475569', marginTop: 8 }}>
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
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 32, fontWeight: 800, color: '#e2e8f0', marginBottom: 8 }}>
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
          <div style={{ textAlign: 'center', padding: 60, background: 'rgba(239,68,68,0.05)', borderRadius: 16, border: '1px dashed rgba(239,68,68,0.2)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <p style={{ color: '#f87171' }}>Failed to load bookings. Check backend connection.</p>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎟️</div>
            <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 22, color: '#e2e8f0', marginBottom: 10 }}>No bookings yet</h3>
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
