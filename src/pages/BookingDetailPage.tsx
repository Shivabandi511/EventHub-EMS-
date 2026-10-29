import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  HiArrowLeft, 
  HiTicket, 
  HiCalendar, 
  HiMapPin, 
  HiUser, 
  HiInformationCircle, 
  HiExclamationTriangle 
} from 'react-icons/hi2';
import { bookingService } from '../services/bookingService';
import CustomerLayout from '../layouts/CustomerLayout';

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.getBooking(Number(id)),
    enabled: !!id,
  });
  const booking = data?.data;

  const statusMap: Record<string, { label: string; cls: string }> = {
    CONFIRMED: { label: 'Confirmed', cls: 'badge-green' },
    CANCELLED: { label: 'Cancelled', cls: 'badge-rose' },
    PENDING:   { label: 'Pending',   cls: 'badge-amber' },
  };

  if (isLoading) return (
    <CustomerLayout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <div className="spinner" style={{ width: 44, height: 44 }} />
      </div>
    </CustomerLayout>
  );

  if (isError || !booking) return (
    <CustomerLayout>
      <div className="state-box" style={{ maxWidth: 500, margin: '80px auto' }}>
        <div style={{ fontSize: 48, color: '#e11d48', marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
          <HiExclamationTriangle />
        </div>
        <p style={{ color: '#6b7280', marginBottom: 20 }}>Booking not found or could not be loaded.</p>
        <Link to="/my-bookings" className="btn btn-primary">
          <HiArrowLeft />
          <span>My Bookings</span>
        </Link>
      </div>
    </CustomerLayout>
  );

  const s = statusMap[booking.status] ?? { label: booking.status, cls: 'badge-purple' };

  return (
    <CustomerLayout>
      <div className="container-app page-container" style={{ maxWidth: 720 }}>
        <nav style={{ marginBottom: 24, fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link to="/my-bookings" style={{ color: '#6b7280', textDecoration: 'none' }}>My Bookings</Link>
          <span>/</span>
          <span style={{ color: '#7c3aed', fontWeight: 600 }}>Booking Details</span>
        </nav>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: 10 }}>
            <HiTicket style={{ color: '#7c3aed' }} />
            <span>Booking Details</span>
          </h1>
          <span className={`badge ${s.cls}`} style={{ fontSize: 13 }}>{s.label}</span>
        </div>

        {/* Reference */}
        <div style={{
          background: '#faf5ff', border: '1.5px solid #d8b4fe',
          borderRadius: 14, padding: '18px 24px', marginBottom: 24, textAlign: 'center',
        }}>
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <HiTicket style={{ color: '#7c3aed' }} />
            <span>Booking Reference</span>
          </p>
          <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 900, color: '#6d28d9', letterSpacing: 2 }}>
            #EH{String(booking.id).padStart(6, '0')}
          </p>
        </div>

        {/* Event */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#7c3aed', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <HiInformationCircle style={{ fontSize: 18 }} />
            <span>Event Information</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#1e1b4b' }}>{booking.event?.title}</p>
            {booking.event?.dateTime && (
              <p style={{ fontSize: 14, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 8 }}>
                <HiCalendar style={{ color: '#7c3aed' }} />
                <span>{new Date(booking.event.dateTime).toLocaleString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
              </p>
            )}
            {booking.event?.venue && (
              <p style={{ fontSize: 14, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 8 }}>
                <HiMapPin style={{ color: '#e11d48' }} />
                <span>{booking.event.venue.name}, {booking.event.venue.city}</span>
              </p>
            )}
          </div>
        </div>

        {/* Ticket summary */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#7c3aed', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <HiTicket style={{ fontSize: 18 }} />
            <span>Ticket Summary</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Tickets Count',  value: `${booking.ticketCount}` },
              { label: 'Price / Ticket', value: `₹${booking.event?.price ?? 0}` },
              { label: 'Total Amount',   value: booking.totalAmount === 0 ? 'Free' : `₹${booking.totalAmount?.toLocaleString('en-IN')}` },
              { label: 'Booked On',      value: booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: '#faf8ff', border: '1px solid #ede9fe', borderRadius: 10, padding: '14px 16px' }}>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#1e1b4b' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Attendees */}
        {booking.attendees && booking.attendees.length > 0 && (
          <div className="glass-card" style={{ padding: 24, marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#7c3aed', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <HiUser style={{ fontSize: 18 }} />
              <span>Attendees List</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {booking.attendees.map((att, i) => (
                <div key={i} style={{ background: '#faf8ff', border: '1px solid #ede9fe', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: 14, flexShrink: 0 }}>
                    {att.name ? att.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1e1b4b' }}>{att.name}</p>
                    <p style={{ fontSize: 12, color: '#6b7280' }}>{att.email} · {att.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link to="/my-bookings" className="btn btn-secondary">
          <HiArrowLeft />
          <span>Back to My Bookings</span>
        </Link>
      </div>
    </CustomerLayout>
  );
}
