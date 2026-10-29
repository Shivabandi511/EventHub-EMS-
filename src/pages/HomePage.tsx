import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  HiSparkles, 
  HiMagnifyingGlass, 
  HiCalendar, 
  HiMapPin, 
  HiArrowRight, 
  HiTicket, 
  HiMusicalNote, 
  HiCpuChip, 
  HiTrophy, 
  HiPaintBrush, 
  HiBriefcase, 
  HiTag
} from 'react-icons/hi2';
import { eventService, categoryService, type Event, type Category } from '../services/eventService';
import CustomerLayout from '../layouts/CustomerLayout';
import { useState } from 'react';
import { getEventImage } from '../assets/images';

const CATEGORY_ICON: Record<string, React.ReactElement> = {
  Technology: <HiCpuChip style={{ color: '#7c3aed' }} />,
  Tech: <HiCpuChip style={{ color: '#7c3aed' }} />,
  'Music & Concerts': <HiMusicalNote style={{ color: '#ec4899' }} />,
  Music: <HiMusicalNote style={{ color: '#ec4899' }} />,
  'Business & Startup': <HiBriefcase style={{ color: '#059669' }} />,
  Business: <HiBriefcase style={{ color: '#059669' }} />,
  'Sports & Fitness': <HiTrophy style={{ color: '#d97706' }} />,
  Sports: <HiTrophy style={{ color: '#d97706' }} />,
  'Arts & Culture': <HiPaintBrush style={{ color: '#db2777' }} />,
  Art: <HiPaintBrush style={{ color: '#db2777' }} />,
};

function EventCard({ event }: { event: Event }) {
  const navigate = useNavigate();
  const date = new Date(event.dateTime);
  const seatsLeft = event.availableSeats;
  const isSoldOut = seatsLeft === 0;
  const eventImg = getEventImage(event.imageUrl, event.category?.name);

  return (
    <div className="event-card" onClick={() => navigate(`/events/${event.id}`)} style={{ cursor: 'pointer' }}>
      <div className="event-card-img-wrap">
        <img src={eventImg} alt={event.title} />
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <span className={`badge ${isSoldOut ? 'badge-rose' : 'badge-green'}`}>
            {isSoldOut ? 'Sold Out' : `${seatsLeft} left`}
          </span>
        </div>
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span className="badge badge-purple">{event.category?.name ?? 'Event'}</span>
        </div>
      </div>

      <div style={{ padding: '18px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1e1b4b', marginBottom: 10, lineHeight: 1.3 }}>
          {event.title}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
            <HiCalendar style={{ color: '#7c3aed', flexShrink: 0 }} />
            <span>
              {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              &nbsp;·&nbsp;{date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </span>
          <span style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
            <HiMapPin style={{ color: '#e11d48', flexShrink: 0 }} />
            <span>{event.venue?.name}, {event.venue?.city}</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f3f0ff' }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#059669' }}>
            {event.price === 0 ? 'Free' : `₹${event.price.toLocaleString('en-IN')}`}
          </span>
          <button
            className="btn btn-primary btn-sm"
            disabled={isSoldOut}
            onClick={e => { e.stopPropagation(); navigate(`/events/${event.id}`); }}
          >
            <HiTicket />
            <span>{isSoldOut ? 'Sold Out' : 'Book Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const HERO_STATS = [
  { value: '500+', label: 'Events Hosted' },
  { value: '50k+', label: 'Tickets Booked' },
  { value: '200+', label: 'Verified Venues' },
  { value: '4.9★', label: 'Customer Rating' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', 'featured'],
    queryFn: () => eventService.getEvents({ size: 6, sort: 'dateTime' }),
    retry: false,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/events?search=${encodeURIComponent(searchTerm)}`);
  };

  const events = eventsData?.data?.content ?? [];
  const categories = categoriesData?.data ?? [];

  return (
    <CustomerLayout>
      {/* ── HERO ── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        padding: '90px 0 80px',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 65%), #faf8ff',
      }}>
        <div className="container-app" style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{ marginBottom: 20 }}>
            <span className="badge badge-purple" style={{ fontSize: 13, padding: '7px 18px', fontWeight: 700 }}>
              <HiSparkles style={{ fontSize: 16 }} />
              <span>Explore Premier Events &amp; Experiences</span>
            </span>
          </div>

          <h1 style={{
            fontWeight: 900,
            fontSize: 'clamp(36px, 6vw, 68px)', lineHeight: 1.1,
            color: '#1e1b4b', marginBottom: 20,
          }}>
            Find &amp; Book Events<br />
            <span className="gradient-text">You'll Remember</span>
          </h1>

          <p style={{ fontSize: 18, color: '#4b5563', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Discover tech summits, concerts, business conferences, sports, and cultural festivals — all in one seamless place.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ maxWidth: 580, margin: '0 auto 60px' }}>
            <div style={{
              display: 'flex', gap: 10,
              background: '#ffffff',
              border: '1.5px solid #ddd6fe',
              borderRadius: 14, padding: 8,
              boxShadow: '0 8px 24px -4px rgba(124, 58, 237, 0.12)',
            }}>
              <input
                id="hero-search"
                type="text" placeholder="Search events, topics, venues…"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: '#1e1b4b', fontSize: 15, padding: '8px 12px',
                }}
              />
              <button id="btn-hero-search" type="submit" className="btn btn-primary" style={{ borderRadius: 10, padding: '10px 24px' }}>
                <HiMagnifyingGlass style={{ fontSize: 16 }} />
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(24px, 5vw, 60px)', flexWrap: 'wrap' }}>
            {HERO_STATS.map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: 32, fontWeight: 900, color: '#7c3aed' }}>{value}</div>
                <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section style={{ padding: '60px 0 20px' }}>
          <div className="container-app">
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1e1b4b', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <HiTag style={{ color: '#7c3aed' }} />
              <span>Browse by Category</span>
            </h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {categories.map((cat: Category) => (
                <button
                  key={cat.id}
                  className="filter-chip"
                  style={{ padding: '10px 22px', fontSize: 14 }}
                  onClick={() => navigate(`/events?categoryId=${cat.id}`)}
                >
                  <span>{CATEGORY_ICON[cat.name] ?? <HiTag />}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Upcoming Events ── */}
      <section style={{ padding: '40px 0 80px' }}>
        <div className="container-app">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: 10 }}>
              <HiCalendar style={{ color: '#7c3aed' }} />
              <span>Upcoming Events</span>
            </h2>
            <Link to="/events" className="btn btn-secondary btn-sm">
              <span>View All</span>
              <HiArrowRight />
            </Link>
          </div>

          {eventsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner" style={{ width: 44, height: 44 }} />
            </div>
          ) : events.length === 0 ? (
            <div className="state-box">
              <div className="state-icon">
                <HiTicket />
              </div>
              <h3 style={{ fontSize: 20, color: '#1e1b4b', marginBottom: 8 }}>No events available</h3>
              <p style={{ color: '#6b7280', fontSize: 14 }}>Events will appear here once published.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
              gap: 26,
            }}>
              {events.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Section (Violet Gradient) ── */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container-app">
          <div style={{
            borderRadius: 24, padding: 'clamp(40px, 5vw, 68px)',
            background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #a21caf 100%)',
            boxShadow: '0 16px 36px -8px rgba(124, 58, 237, 0.35)',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <h2 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 800, color: '#ffffff', marginBottom: 16 }}>
              Ready to Experience Something Incredible?
            </h2>
            <p style={{ fontSize: 16, color: '#f3e8ff', maxWidth: 540, margin: '0 auto 32px' }}>
              Join thousands of attendees discovering live entertainment, technology breakthroughs, and networking.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/events" className="btn btn-secondary btn-lg" style={{ background: '#ffffff', color: '#6d28d9', border: 'none' }}>
                <HiTicket />
                <span>Explore All Events</span>
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg" style={{ background: 'rgba(255,255,255,0.18)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}>
                <HiSparkles />
                <span>Sign Up Free</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </CustomerLayout>
  );
}
