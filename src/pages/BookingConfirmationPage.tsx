import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../services/bookingService';
import CustomerLayout from '../layouts/CustomerLayout';

export default function BookingConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingService.getBooking(Number(bookingId)),
    enabled: !!bookingId,
  });

  const booking = data?.data;

  if (isLoading) return (
    <CustomerLayout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <div className="spinner" style={{ width: 44, height: 44 }} />
      </div>
    </CustomerLayout>
  );

  return (
    <CustomerLayout>
      <div className="container-app" style={{ padding: '60px 24px', maxWidth: 640 }}>
        {/* Success header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%', margin: '0 auto 20px',
            background: '#ecfdf5', border: '2px solid #a7f3d0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40, boxShadow: '0 4px 20px rgba(5,150,105,0.15)',
          }}>✅</div>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 32, fontWeight: 800, color: '#059669', marginBottom: 8 }}>
            Booking Confirmed!
          </h1>
          <p style={{ color: '#64748b', fontSize: 16 }}>
            Your tickets are reserved. Have a great time!
          </p>
        </div>

        {booking ? (
          <div className="glass-card" style={{ padding: 32, marginBottom: 24, boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.08)' }}>
            {/* Booking ID */}
            <div style={{
              background: '#eff6ff', border: '1px solid #bfdbfe',
              borderRadius: 12, padding: '14px 20px', marginBottom: 24, textAlign: 'center',
            }}>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Booking Reference</p>
              <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 24, fontWeight: 900, color: '#1d4ed8', letterSpacing: 2 }}>
                #EH{String(booking.id).padStart(6, '0')}
              </p>
            </div>

            {/* Event info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 3 }}>Event</p>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{booking.event?.title}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Date & Time', value: new Date(booking.event?.dateTime).toLocaleString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) },
                  { label: 'Venue',       value: `${booking.event?.venue?.name}, ${booking.event?.venue?.city}` },
                  { label: 'Tickets',     value: `${booking.ticketCount} ticket${booking.ticketCount > 1 ? 's' : ''}` },
                  { label: 'Total Paid',  value: booking.totalAmount === 0 ? 'Free' : `₹${booking.totalAmount.toLocaleString('en-IN')}` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px' }}>
                    <p style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{label}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="divider" />
            <p style={{ textAlign: 'center', fontSize: 12, color: '#64748b' }}>
              📧 A confirmation has been recorded. Bring this booking reference to the event.
            </p>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: 32, textAlign: 'center', marginBottom: 24 }}>
            <p style={{ color: '#64748b' }}>Your booking was successfully created.</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/my-bookings" className="btn btn-primary">View My Bookings</Link>
          <Link to="/events" className="btn btn-secondary">Browse More Events</Link>
        </div>
      </div>
    </CustomerLayout>
  );
}
