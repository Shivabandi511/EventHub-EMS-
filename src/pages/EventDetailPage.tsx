import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  HiCalendar, 
  HiMapPin, 
  HiTicket, 
  HiArrowLeft, 
  HiBuildingOffice2, 
  HiUserGroup, 
  HiBanknotes, 
  HiExclamationTriangle,
  HiNoSymbol
} from 'react-icons/hi2';
import { eventService } from '../services/eventService';
import CustomerLayout from '../layouts/CustomerLayout';
import { useAuth } from '../context/AuthContext';
import { getEventImage } from '../assets/images';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getEvent(Number(id)),
    enabled: !!id,
  });

  const event = data?.data;

  if (isLoading) return (
    <CustomerLayout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <div className="spinner" style={{ width: 48, height: 48 }} />
      </div>
    </CustomerLayout>
  );

  if (isError || !event) return (
    <CustomerLayout>
      <div className="state-box" style={{ maxWidth: 500, margin: '80px auto' }}>
        <div style={{ fontSize: 52, color: '#e11d48', marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
          <HiExclamationTriangle />
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1e1b4b', marginBottom: 10 }}>Event Not Found</h2>
        <p style={{ color: '#6b7280', marginBottom: 24 }}>This event may have been removed or does not exist.</p>
        <Link to="/events" className="btn btn-primary btn-md">
          <HiArrowLeft />
          <span>Browse Events</span>
        </Link>
      </div>
    </CustomerLayout>
  );

  const date       = new Date(event.dateTime);
  const isSoldOut  = event.availableSeats === 0;
  const isCancelled = event.status === 'CANCELLED';
  const eventImg   = getEventImage(event.imageUrl, event.category?.name);

  return (
    <CustomerLayout>
      <div className="container-app page-container">
        {/* Breadcrumb */}
        <nav style={{ marginBottom: 24, fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link to="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link to="/events" style={{ color: '#6b7280', textDecoration: 'none' }}>Events</Link>
          <span>/</span>
          <span style={{ color: '#7c3aed', fontWeight: 600 }}>{event.title}</span>
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>
          {/* ── Left: Details ── */}
          <div>
            {/* Event Image */}
            <div style={{
              height: 360, borderRadius: 20, overflow: 'hidden',
              background: '#f5f3ff',
              position: 'relative', marginBottom: 28,
              border: '1px solid #ede9fe',
            }}>
              <img src={eventImg} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8 }}>
                <span className="badge badge-purple">{event.category?.name}</span>
                {isCancelled && <span className="badge badge-rose">Cancelled</span>}
                {isSoldOut   && !isCancelled && <span className="badge badge-rose">Sold Out</span>}
              </div>
            </div>

            {/* Title */}
            <h1 style={{ fontSize: 34, fontWeight: 800, color: '#1e1b4b', marginBottom: 20, lineHeight: 1.2 }}>
              {event.title}
            </h1>

            {/* Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
              {[
                { icon: <HiCalendar style={{ color: '#7c3aed', fontSize: 20 }} />, label: 'Date & Time', value: `${date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` },
                { icon: <HiMapPin style={{ color: '#e11d48', fontSize: 20 }} />, label: 'Venue', value: `${event.venue?.name}, ${event.venue?.city}` },
                { icon: <HiBuildingOffice2 style={{ color: '#059669', fontSize: 20 }} />, label: 'Address', value: event.venue?.address },
                { icon: <HiUserGroup style={{ color: '#d97706', fontSize: 20 }} />, label: 'Capacity', value: `${event.venue?.capacity?.toLocaleString('en-IN')} seats` },
                { icon: <HiTicket style={{ color: '#7c3aed', fontSize: 20 }} />, label: 'Available Seats', value: isSoldOut ? 'Sold Out' : `${event.availableSeats} / ${event.totalSeats}` },
                { icon: <HiBanknotes style={{ color: '#059669', fontSize: 20 }} />, label: 'Ticket Price', value: event.price === 0 ? 'Free' : `₹${event.price.toLocaleString('en-IN')}` },
              ].map(({ icon, label, value }) => (
                <div key={label} className="glass-card" style={{ padding: '16px 18px' }}>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {icon}
                    <span>{label}</span>
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#1e1b4b' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e1b4b', marginBottom: 12 }}>
                About This Event
              </h2>
              <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8 }}>
                {event.description ?? 'No description provided.'}
              </p>
            </div>
          </div>

          {/* ── Right: Booking Card ── */}
          <div style={{ position: 'sticky', top: 90 }}>
            <div className="glass-card" style={{ padding: 28, boxShadow: '0 8px 30px rgba(124, 58, 237, 0.08)' }}>
              <div style={{ marginBottom: 20, paddingBottom: 18, borderBottom: '1px solid #ede9fe' }}>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>Price per ticket</p>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 36, fontWeight: 900, color: '#059669' }}>
                  {event.price === 0 ? 'Free' : `₹${event.price.toLocaleString('en-IN')}`}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#6b7280' }}>Status</span>
                  <span className={`badge ${isCancelled ? 'badge-rose' : isSoldOut ? 'badge-rose' : 'badge-green'}`}>
                    {isCancelled ? 'Cancelled' : isSoldOut ? 'Sold Out' : 'Available'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#6b7280' }}>Seats Left</span>
                  <span style={{ color: '#1e1b4b', fontWeight: 700 }}>{event.availableSeats}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#6b7280' }}>Venue Capacity</span>
                  <span style={{ color: '#1e1b4b', fontWeight: 700 }}>{event.venue?.capacity?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {!isCancelled && !isSoldOut ? (
                isAuthenticated ? (
                  <button
                    id="btn-book-now"
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                    onClick={() => navigate(`/booking/${event.id}`)}
                  >
                    <HiTicket style={{ fontSize: 20 }} />
                    <span>Book Tickets</span>
                  </button>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>Sign in to reserve your tickets</p>
                    <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                      <HiTicket style={{ fontSize: 18 }} />
                      <span>Login to Book</span>
                    </Link>
                  </div>
                )
              ) : (
                <button className="btn btn-secondary btn-lg" style={{ width: '100%' }} disabled>
                  <HiNoSymbol style={{ fontSize: 18 }} />
                  <span>{isCancelled ? 'Event Cancelled' : 'Sold Out'}</span>
                </button>
              )}

              <Link to="/events" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 18, fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>
                <HiArrowLeft />
                <span>Back to Events</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
