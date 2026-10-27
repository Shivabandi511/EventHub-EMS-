import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { eventService, type Event } from '../../services/eventService';
import { bookingService, type Booking } from '../../services/bookingService';
import AdminLayout from '../../layouts/AdminLayout';

const StatCard = ({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) => (
  <div className="glass-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ width: 52, height: 52, borderRadius: 14, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
    <div>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 28, fontWeight: 800, color: '#e2e8f0' }}>{value}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const { data: eventsData } = useQuery({
    queryKey: ['admin-events-count'],
    queryFn: () => eventService.getEvents({ size: 1 }),
    retry: false,
  });

  const { data: bookingsData } = useQuery({
    queryKey: ['admin-bookings-all'],
    queryFn: () => bookingService.getAllBookings({ size: 1 }),
    retry: false,
  });

  const { data: recentEvents } = useQuery({
    queryKey: ['admin-recent-events'],
    queryFn: () => eventService.getEvents({ size: 5, sort: 'dateTime,desc' }),
    retry: false,
  });

  const { data: recentBookings } = useQuery({
    queryKey: ['admin-recent-bookings'],
    queryFn: () => bookingService.getAllBookings({ size: 5 }),
    retry: false,
  });

  const totalEvents   = eventsData?.data?.totalElements   ?? '—';
  const totalBookings = bookingsData?.data?.totalElements ?? '—';
  const events   = recentEvents?.data?.content   ?? [];
  const bookings = recentBookings?.data?.content ?? [];

  return (
    <AdminLayout>
      <div style={{ maxWidth: 1100 }}>
        {/* Welcome */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 28, fontWeight: 800, color: '#e2e8f0', marginBottom: 6 }}>
            Dashboard Overview
          </h1>
          <p style={{ color: '#64748b', fontSize: 15 }}>Welcome back! Here's what's happening with EventHub.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
          <StatCard icon="🎭" label="Total Events"   value={totalEvents}   color="rgba(124,58,237,0.2)" />
          <StatCard icon="🎟️" label="Total Bookings" value={totalBookings} color="rgba(6,182,212,0.2)" />
          <StatCard icon="👥" label="Active Events"   value={events.filter((e: Event) => e.status === 'ACTIVE').length}  color="rgba(34,197,94,0.2)" />
          <StatCard icon="💰" label="Revenue Today"   value="₹—"           color="rgba(234,179,8,0.2)" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          {/* Recent Events */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>Recent Events</h2>
              <Link to="/admin/events" className="btn btn-secondary btn-sm">View All</Link>
            </div>
            {events.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>No events yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {events.map((ev: Event) => (
                  <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{ev.title}</p>
                      <p style={{ fontSize: 12, color: '#64748b' }}>{new Date(ev.dateTime).toLocaleDateString('en-IN')}</p>
                    </div>
                    <span className={`badge ${ev.status === 'ACTIVE' ? 'badge-green' : ev.status === 'CANCELLED' ? 'badge-red' : 'badge-yellow'}`}>
                      {ev.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>Recent Bookings</h2>
              <Link to="/admin/bookings" className="btn btn-secondary btn-sm">View All</Link>
            </div>
            {bookings.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>No bookings yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {bookings.map((bk: Booking) => (
                  <div key={bk.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{bk.event?.title ?? 'Event'}</p>
                      <p style={{ fontSize: 12, color: '#64748b' }}>{bk.ticketCount} ticket{bk.ticketCount > 1 ? 's' : ''} · ₹{bk.totalAmount}</p>
                    </div>
                    <span className={`badge ${bk.status === 'CONFIRMED' ? 'badge-green' : bk.status === 'CANCELLED' ? 'badge-red' : 'badge-yellow'}`}>
                      {bk.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginTop: 28 }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/admin/events" className="btn btn-primary">➕ Create Event</Link>
            <Link to="/admin/categories" className="btn btn-secondary">🏷️ Manage Categories</Link>
            <Link to="/admin/venues" className="btn btn-secondary">📍 Manage Venues</Link>
            <Link to="/admin/bookings" className="btn btn-secondary">🎟️ View Bookings</Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
