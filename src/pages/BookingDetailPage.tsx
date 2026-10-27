import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../services/bookingService';
import CustomerLayout from '../layouts/CustomerLayout';

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.getBooking(Number(id)),
    enabled: !!id,
  });
  const booking = data?.data;

  const statusMap: Record<string, { label: string; cls: string }> = {
    CONFIRMED: { label: 'Confirmed', cls: 'badge-green' },
    CANCELLED: { label: 'Cancelled', cls: 'badge-red' },
    PENDING:   { label: 'Pending',   cls: 'badge-yellow' },
  };

  if (isLoading) return (
    <CustomerLayout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <div className="spinner" style={{ width: 44, height: 44 }} />
      </div>
    </CustomerLayout>
  );

  if (!booking) return (
    <CustomerLayout>
      <div style={{ textAlign: 'center', padding: 80 }}>
        <p style={{ color: '#64748b', marginBottom: 20 }}>Booking not found.</p>
        <Link to="/my-bookings" className="btn btn-primary">← My Bookings</Link>
      </div>
    </CustomerLayout>
  );

  const s = statusMap[booking.status] ?? { label: booking.status, cls: 'badge-purple' };

  return (
    <CustomerLayout>
      <div className="container-app" style={{ padding: '40px 24px', maxWidth: 680 }}>
        <nav style={{ marginBottom: 24, fontSize: 13, color: '#64748b' }}>
          <Link to="/my-bookings" style={{ color: '#64748b', textDecoration: 'none' }}>My Bookings</Link>
          {' / '}
          <span style={{ color: '#a78bfa' }}>Booking Details</span>
        </nav>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 28, fontWeight: 800, color: '#e2e8f0' }}>
            Booking Details
          </h1>
          <span className={`badge ${s.cls}`} style={{ fontSize: 13 }}>{s.label}</span>
        </div>

        {/* Reference */}
        <div style={{
          background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: 12, padding: '16px 20px', marginBottom: 24, textAlign: 'center',
        }}>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Booking Reference</p>
          <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 24, fontWeight: 800, color: '#a78bfa', letterSpacing: 2 }}>
            #EH{String(booking.id).padStart(6, '0')}
          </p>
        </div>

        {/* Event */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 16, fontWeight: 700, color: '#a78bfa', marginBottom: 16 }}>Event Information</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 700, color: '#e2e8f0' }}>{booking.event?.title}</p>
            <p style={{ fontSize: 14, color: '#94a3b8' }}>
              📅 {new Date(booking.event?.dateTime).toLocaleString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}
            </p>
            <p style={{ fontSize: 14, color: '#94a3b8' }}>
              📍 {booking.event?.venue?.name}, {booking.event?.venue?.city}
            </p>
          </div>
        </div>

        {/* Ticket summary */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 16, fontWeight: 700, color: '#a78bfa', marginBottom: 16 }}>Ticket Summary</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Tickets',       value: `${booking.ticketCount}` },
              { label: 'Price / Ticket', value: `₹${booking.event?.price}` },
              { label: 'Total Amount',  value: booking.totalAmount === 0 ? 'Free' : `₹${booking.totalAmount.toLocaleString('en-IN')}` },
              { label: 'Booked On',    value: new Date(booking.bookingDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 11, color: '#64748b', marginBottom: 3 }}>{label}</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Attendees */}
        {booking.attendees && booking.attendees.length > 0 && (
          <div className="glass-card" style={{ padding: 24, marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 16, fontWeight: 700, color: '#a78bfa', marginBottom: 16 }}>Attendees</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {booking.attendees.map((att, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: 14, flexShrink: 0 }}>
                    {att.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{att.name}</p>
                    <p style={{ fontSize: 12, color: '#64748b' }}>{att.email} · {att.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link to="/my-bookings" className="btn btn-secondary">← Back to My Bookings</Link>
      </div>
    </CustomerLayout>
  );
}
