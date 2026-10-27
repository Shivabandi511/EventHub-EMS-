import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventService, categoryService, type Event, type Category } from '../services/eventService';
import CustomerLayout from '../layouts/CustomerLayout';
import { useState } from 'react';

const CATEGORIES_EMOJI: Record<string, string> = {
  Music: '🎵', Tech: '💻', Sports: '⚽', Art: '🎨', Food: '🍽️',
  Business: '💼', Education: '📚', Health: '❤️', Comedy: '😄', Dance: '💃',
};

function EventCard({ event }: { event: Event }) {
  const navigate = useNavigate();
  const date = new Date(event.dateTime);
  const seatsLeft = event.availableSeats;
  const isSoldOut = seatsLeft === 0;

  return (
    <div className="event-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/events/${event.id}`)}>
      {/* Image / placeholder */}
      <div style={{
        height: 180, background: 'linear-gradient(135deg, #1a1a3e, #252552)',
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {event.imageUrl
          ? <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 52 }}>{CATEGORIES_EMOJI[event.category?.name] ?? '🎭'}</span>}
        <div style={{
          position: 'absolute', top: 12, right: 12,
        }}>
          <span className={`badge ${isSoldOut ? 'badge-red' : 'badge-green'}`}>
            {isSoldOut ? 'Sold Out' : `${seatsLeft} left`}
          </span>
        </div>
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span className="badge badge-purple">{event.category?.name ?? 'Event'}</span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '16px 18px 18px' }}>
        <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 8, lineHeight: 1.3 }}>
          {event.title}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            📅 {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            &nbsp;·&nbsp;{date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            📍 {event.venue?.name}, {event.venue?.city}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#a78bfa' }}>
            {event.price === 0 ? 'Free' : `₹${event.price.toLocaleString('en-IN')}`}
          </span>
          <button
            className="btn btn-primary btn-sm"
            disabled={isSoldOut}
            onClick={e => { e.stopPropagation(); navigate(`/events/${event.id}`); }}
          >
            {isSoldOut ? 'Sold Out' : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Mock featured events for hero (used when API not ready) ──
const HERO_STATS = [
  { value: '500+', label: 'Events' },
  { value: '50k+', label: 'Tickets Sold' },
  { value: '200+', label: 'Venues' },
  { value: '4.8★', label: 'Rating' },
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

  const events   = eventsData?.data?.content ?? [];
  const categories = categoriesData?.data ?? [];

  return (
    <CustomerLayout>
      {/* ── HERO ── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        padding: '90px 0 80px',
        background: 'radial-gradient(ellipse at 70% 50%, rgba(124,58,237,0.2) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(6,182,212,0.12) 0%, transparent 50%), var(--color-surface-900)',
      }}>
        {/* Background glow orbs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(124,58,237,0.08)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(6,182,212,0.07)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div className="container-app" style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ marginBottom: 24 }}>
            <span className="badge badge-purple" style={{ fontSize: 13, padding: '6px 16px' }}>
              🎉 Discover Amazing Events
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Outfit,sans-serif', fontWeight: 900,
            fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 1.1,
            color: '#f1f5f9', marginBottom: 20,
          }}>
            Find & Book Events<br />
            <span className="gradient-text">You'll Love</span>
          </h1>

          <p style={{ fontSize: 18, color: '#64748b', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Discover concerts, conferences, sports events, and more — all in one place. Book tickets instantly.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ maxWidth: 580, margin: '0 auto 60px' }}>
            <div style={{
              display: 'flex', gap: 10,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, padding: 8,
              backdropFilter: 'blur(12px)',
            }}>
              <input
                id="hero-search"
                type="text" placeholder="Search events, artists, venues…"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: '#e2e8f0', fontSize: 15, padding: '8px 12px',
                }}
              />
              <button id="btn-hero-search" type="submit" className="btn btn-primary" style={{ borderRadius: 10, padding: '10px 24px' }}>
                🔍 Search
              </button>
            </div>
          </form>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(24px, 5vw, 60px)', flexWrap: 'wrap' }}>
            {HERO_STATS.map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: 28, fontWeight: 800, color: '#a78bfa' }}>{value}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section style={{ padding: '60px 0' }}>
          <div className="container-app">
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 24, fontWeight: 700, color: '#e2e8f0', marginBottom: 24 }}>
              Browse by Category
            </h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {categories.map((cat: Category) => (
                <button
                  key={cat.id}
                  className="btn btn-secondary"
                  style={{ borderRadius: 999, padding: '8px 20px', fontSize: 14 }}
                  onClick={() => navigate(`/events?categoryId=${cat.id}`)}
                >
                  {CATEGORIES_EMOJI[cat.name] ?? '🎪'} {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Upcoming Events ── */}
      <section style={{ padding: '20px 0 80px' }}>
        <div className="container-app">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 24, fontWeight: 700, color: '#e2e8f0' }}>
              Upcoming Events
            </h2>
            <Link to="/events" className="btn btn-secondary btn-sm">View All →</Link>
          </div>

          {eventsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
          ) : events.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: 60,
              background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.08)',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎭</div>
              <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, color: '#e2e8f0', marginBottom: 8 }}>No events yet</h3>
              <p style={{ color: '#64748b', fontSize: 14 }}>Events will appear here once the backend is connected.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 24,
            }}>
              {events.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container-app">
          <div style={{
            borderRadius: 24, padding: 'clamp(40px, 5vw, 64px)',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(6,182,212,0.15) 100%)',
            border: '1px solid rgba(139,92,246,0.2)',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.15), transparent 70%)', pointerEvents: 'none' }} />
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, color: '#f1f5f9', marginBottom: 16, position: 'relative' }}>
              Ready to Experience Something Amazing?
            </h2>
            <p style={{ fontSize: 16, color: '#94a3b8', marginBottom: 32, position: 'relative' }}>
              Join thousands of event-goers. Browse events and book your tickets today.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
              <Link to="/events" className="btn btn-primary btn-lg">Explore Events 🎭</Link>
              <Link to="/register" className="btn btn-secondary btn-lg">Sign Up Free</Link>
            </div>
          </div>
        </div>
      </section>
    </CustomerLayout>
  );
}
