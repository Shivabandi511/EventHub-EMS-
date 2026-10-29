import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  HiCheckCircle, 
  HiTicket, 
  HiCalendar, 
  HiMapPin, 
  HiEnvelope, 
  HiMagnifyingGlass 
} from 'react-icons/hi2';
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
      <div className="container-app page-container" style={{ maxWidth: 660 }}>
        {/* Success header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 84, height: 84, borderRadius: '50%', margin: '0 auto 18px',
            background: '#ecfdf5', border: '2px solid #a7f3d0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 48, color: '#059669', boxShadow: '0 8px 24px rgba(5,150,105,0.18)',
          }}>
            <HiCheckCircle />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#065f46', marginBottom: 8 }}>
            Booking Confirmed!
          </h1>
          <p style={{ color: '#4b5563', fontSize: 16 }}>
            Your tickets are reserved. We have saved your confirmation.
          </p>
        </div>

        {booking ? (
          <div className="glass-card" style={{ padding: 32, marginBottom: 24, boxShadow: '0 8px 30px rgba(124, 58, 237, 0.08)' }}>
            {/* Reference Badge */}
            <div style={{
              background: '#faf5ff', border: '1.5px solid #d8b4fe',
              borderRadius: 14, padding: '16px 20px', marginBottom: 24, textAlign: 'center',
            }}>
              <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <HiTicket style={{ color: '#7c3aed' }} />
                <span>Booking Reference</span>
              </p>
              <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 900, color: '#6d28d9', letterSpacing: 2 }}>
                #EH{String(booking.id).padStart(6, '0')}
              </p>
            </div>

            {/* Event info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Event Title</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#1e1b4b' }}>{booking.event?.title}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { icon: <HiCalendar style={{ color: '#7c3aed' }} />, label: 'Date & Time', value: booking.event?.dateTime ? new Date(booking.event.dateTime).toLocaleString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—' },
                  { icon: <HiMapPin style={{ color: '#e11d48' }} />, label: 'Venue',       value: booking.event?.venue ? `${booking.event.venue.name}, ${booking.event.venue.city}` : '—' },
                  { icon: <HiTicket style={{ color: '#7c3aed' }} />, label: 'Tickets',     value: `${booking.ticketCount} ticket${booking.ticketCount > 1 ? 's' : ''}` },
                  { icon: <span style={{ color: '#059669', fontWeight: 800 }}>₹</span>, label: 'Total Paid',  value: booking.totalAmount === 0 ? 'Free' : `₹${booking.totalAmount?.toLocaleString('en-IN')}` },
                ].map(({ icon, label, value }) => (
                  <div key={label} style={{ background: '#faf8ff', border: '1px solid #ede9fe', borderRadius: 12, padding: '14px 16px' }}>
                    <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {icon}
                      <span>{label}</span>
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1e1b4b' }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="divider" style={{ margin: '24px 0 18px' }} />
            <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <HiEnvelope style={{ color: '#7c3aed' }} />
              <span>Bring this reference code with you to the event check-in desk.</span>
            </p>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: 32, textAlign: 'center', marginBottom: 24 }}>
            <p style={{ color: '#6b7280' }}>Your booking was successfully registered.</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/my-bookings" className="btn btn-primary btn-md">
            <HiTicket />
            <span>View My Bookings</span>
          </Link>
          <Link to="/events" className="btn btn-secondary btn-md">
            <HiMagnifyingGlass />
            <span>Browse More Events</span>
          </Link>
        </div>
      </div>
    </CustomerLayout>
  );
}
