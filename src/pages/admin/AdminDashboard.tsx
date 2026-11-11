import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  HiCalendarDays,
  HiTicket,
  HiSparkles,
  HiBanknotes,
  HiPlus,
  HiTag,
  HiMapPin,
  HiUsers,
  HiArrowRight,
  HiChartBar
} from 'react-icons/hi2';
import { eventService, type Event } from '../../services/eventService';
import { bookingService, type Booking } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../layouts/AdminLayout';

const StatCard = ({ icon, label, value, color }: { icon: React.ReactElement; label: string; value: string | number; color: string }) => (
  <div className="glass-card" style={{ padding: 22, display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ width: 50, height: 50, borderRadius: 14, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4, fontWeight: 500 }}>{label}</p>
      <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 900, color: '#0F172A' }}>{value}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const { isSuperAdmin, user } = useAuth();

  const { data: eventsData } = useQuery({
    queryKey: ['admin-events-count'],
    queryFn: () => eventService.getMyAdminEvents({ size: 1 }),
    retry: false,
  });

  const { data: bookingsData } = useQuery({
    queryKey: ['admin-bookings-all'],
    queryFn: () => bookingService.getAllBookings({ size: 1 }),
    retry: false,
  });

  const { data: recentEvents } = useQuery({
    queryKey: ['admin-recent-events'],
    queryFn: () => eventService.getMyAdminEvents({ size: 5, sort: 'dateTime,desc' }),
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
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
            <HiChartBar style={{ color: '#10B981' }} />
            <span>{isSuperAdmin ? 'Super Admin Overview' : 'Admin Dashboard'}</span>
          </h1>
          <p style={{ color: '#64748B', fontSize: 15 }}>
            {isSuperAdmin
              ? 'Manage platform events, assign admin permissions to users, and monitor all bookings.'
              : `Welcome back, ${user?.name}! Create and manage events hosted by your admin account.`}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, marginBottom: 36 }}>
          <StatCard
            icon={<HiCalendarDays style={{ color: '#059669' }} />}
            label={isSuperAdmin ? 'Total Events' : 'My Events'}
            value={totalEvents}
            color="#ECFDF5"
          />
          <StatCard
            icon={<HiTicket style={{ color: '#059669' }} />}
            label={isSuperAdmin ? 'Total Bookings' : 'Bookings on My Events'}
            value={totalBookings}
            color="#ECFDF5"
          />
          <StatCard
            icon={<HiSparkles style={{ color: '#0D9488' }} />}
            label="Active Events"
            value={events.filter((e: Event) => e.status === 'ACTIVE').length}
            color="#F0FDF4"
          />
          <StatCard
            icon={<HiBanknotes style={{ color: '#D97706' }} />}
            label="Account Role"
            value={isSuperAdmin ? 'Super Admin' : 'Admin'}
            color="#FFFBEB"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 24 }}>
          {/* Recent Events */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                <HiCalendarDays style={{ color: '#10B981' }} />
                <span>{isSuperAdmin ? 'Recent Events' : 'My Recent Events'}</span>
              </h2>
              <Link to="/admin/events" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span>View All</span>
                <HiArrowRight style={{ fontSize: 12 }} />
              </Link>
            </div>
            {events.length === 0 ? (
              <p style={{ color: '#64748B', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
                No events created yet. Click "Create Event" below to publish your first event.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {events.map((ev: Event) => (
                  <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{ev.title}</p>
                      <p style={{ fontSize: 12, color: '#64748B' }}>
                        {new Date(ev.dateTime).toLocaleDateString('en-IN')}
                        {isSuperAdmin && ev.createdByName ? ` · by ${ev.createdByName}` : ''}
                      </p>
                    </div>
                    <span className={`badge ${ev.status === 'ACTIVE' ? 'badge-green' : ev.status === 'CANCELLED' ? 'badge-red' : 'badge-yellow'}`}>{ev.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                <HiTicket style={{ color: '#10B981' }} />
                <span>Recent Bookings</span>
              </h2>
              <Link to="/admin/bookings" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span>View All</span>
                <HiArrowRight style={{ fontSize: 12 }} />
              </Link>
            </div>
            {bookings.length === 0 ? (
              <p style={{ color: '#64748B', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>No bookings yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {bookings.map((bk: Booking) => (
                  <div key={bk.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{bk.event?.title ?? 'Event'}</p>
                      <p style={{ fontSize: 12, color: '#64748B' }}>{bk.ticketCount} ticket{bk.ticketCount > 1 ? 's' : ''} · ₹{bk.totalAmount}</p>
                    </div>
                    <span className={`badge ${bk.status === 'CONFIRMED' ? 'badge-green' : bk.status === 'CANCELLED' ? 'badge-red' : 'badge-yellow'}`}>{bk.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginTop: 28 }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/admin/events" className="btn btn-primary btn-md" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <HiPlus />
              <span>Create Event</span>
            </Link>
            {isSuperAdmin && (
              <Link to="/admin/users" className="btn btn-secondary btn-md" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderColor: '#10B981', color: '#059669' }}>
                <HiUsers style={{ color: '#10B981' }} />
                <span>Manage Admins & Users</span>
              </Link>
            )}
            <Link to="/admin/categories" className="btn btn-secondary btn-md" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <HiTag />
              <span>Manage Categories</span>
            </Link>
            <Link to="/admin/venues" className="btn btn-secondary btn-md" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <HiMapPin />
              <span>Manage Venues</span>
            </Link>
            <Link to="/admin/bookings" className="btn btn-secondary btn-md" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <HiTicket />
              <span>View Bookings</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
