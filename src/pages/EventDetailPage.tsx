import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventService } from '../services/eventService';
import CustomerLayout from '../layouts/CustomerLayout';
import { useAuth } from '../context/AuthContext';

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
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>😕</div>
        <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 28, color: '#e2e8f0', marginBottom: 12 }}>Event Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: 24 }}>This event may have been removed or doesn't exist.</p>
        <Link to="/events" className="btn btn-primary">← Browse Events</Link>
      </div>
    </CustomerLayout>
  );

  const date       = new Date(event.dateTime);
  const isSoldOut  = event.availableSeats === 0;
  const isCancelled = event.status === 'CANCELLED';

  return (
    <CustomerLayout>
      <div className="container-app" style={{ padding: '40px 24px' }}>
        {/* Breadcrumb */}
        <nav style={{ marginBottom: 28, fontSize: 13, color: '#64748b' }}>
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
          {' / '}
          <Link to="/events" style={{ color: '#64748b', textDecoration: 'none' }}>Events</Link>
          {' / '}
          <span style={{ color: '#2563eb', fontWeight: 600 }}>{event.title}</span>
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>
          {/* ── Left: Details ── */}
          <div>
            {/* Event Image / Placeholder */}
            <div style={{
              height: 340, borderRadius: 20, overflow: 'hidden',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 32, position: 'relative',
              border: '1px solid #e2e8f0',
            }}>
              {event.imageUrl
                ? <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 80 }}>🎭</span>}
              <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8 }}>
                <span className="badge badge-purple">{event.category?.name}</span>
                {isCancelled && <span className="badge badge-red">Cancelled</span>}
                {isSoldOut   && !isCancelled && <span className="badge badge-red">Sold Out</span>}
              </div>
            </div>

            {/* Title */}
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 36, fontWeight: 800, color: '#0f172a', marginBottom: 20, lineHeight: 1.2 }}>
              {event.title}
            </h1>

            {/* Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
              {[
                { icon: '📅', label: 'Date & Time', value: `${date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` },
                { icon: '📍', label: 'Venue', value: `${event.venue?.name}, ${event.venue?.city}` },
                { icon: '📬', label: 'Address', value: event.venue?.address },
                { icon: '🏟️', label: 'Capacity', value: `${event.venue?.capacity?.toLocaleString('en-IN')} seats` },
                { icon: '🎟️', label: 'Available Seats', value: isSoldOut ? 'Sold Out' : `${event.availableSeats} / ${event.totalSeats}` },
                { icon: '💰', label: 'Ticket Price', value: event.price === 0 ? 'Free' : `₹${event.price.toLocaleString('en-IN')}` },
              ].map(({ icon, label, value }) => (
                <div key={label} className="glass-card" style={{ padding: '14px 18px' }}>
                  <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{icon} {label}</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                About This Event
              </h2>
              <p style={{ fontSize: 15, color: '#334155', lineHeight: 1.8 }}>
                {event.description ?? 'No description provided.'}
              </p>
            </div>
          </div>

          {/* ── Right: Booking Card ── */}
          <div style={{ position: 'sticky', top: 90 }}>
            <div className="glass-card" style={{ padding: 28, boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.08)' }}>
              <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>Price per ticket</p>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 36, fontWeight: 900, color: '#2563eb' }}>
                  {event.price === 0 ? 'Free' : `₹${event.price.toLocaleString('en-IN')}`}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>Status</span>
                  <span className={`badge ${isCancelled ? 'badge-red' : isSoldOut ? 'badge-red' : 'badge-green'}`}>
                    {isCancelled ? 'Cancelled' : isSoldOut ? 'Sold Out' : 'Available'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>Seats Left</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{event.availableSeats}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>Venue Capacity</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{event.venue?.capacity?.toLocaleString('en-IN')}</span>
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
                    🎟️ Book Tickets
                  </button>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>Sign in to book tickets</p>
                    <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%', display: 'block' }}>
                      Login to Book
                    </Link>
                  </div>
                )
              ) : (
                <button className="btn btn-secondary btn-lg" style={{ width: '100%' }} disabled>
                  {isCancelled ? '❌ Event Cancelled' : '🚫 Sold Out'}
                </button>
              )}

              <Link to="/events" style={{ display: 'block', textAlign: 'center', marginTop: 16, fontSize: 13, color: '#64748b', textDecoration: 'none' }}>
                ← Back to Events
              </Link>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
