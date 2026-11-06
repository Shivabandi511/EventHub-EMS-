import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  HiCalendar, 
  HiMapPin, 
  HiTicket, 
  HiArrowRight, 
  HiMagnifyingGlass, 
  HiExclamationTriangle, 
  HiChevronLeft, 
  HiChevronRight, 
  HiXMark,
  HiCpuChip,
  HiMusicalNote,
  HiBriefcase,
  HiTrophy,
  HiPaintBrush,
  HiGlobeAmericas
} from 'react-icons/hi2';
import { eventService, type Event } from '../services/eventService';
import CustomerLayout from '../layouts/CustomerLayout';
import { useCity } from '../context/CityContext';
import { getEventImage, getCategoryFallback } from '../assets/images';

const CATEGORY_ICON: Record<string, React.ReactElement> = {
  Technology: <HiCpuChip style={{ color: '#10b981' }} />,
  Tech: <HiCpuChip style={{ color: '#10b981' }} />,
  'Music & Concerts': <HiMusicalNote style={{ color: '#ec4899' }} />,
  Music: <HiMusicalNote style={{ color: '#ec4899' }} />,
  'Business & Startup': <HiBriefcase style={{ color: '#059669' }} />,
  Business: <HiBriefcase style={{ color: '#059669' }} />,
  'Sports & Fitness': <HiTrophy style={{ color: '#d97706' }} />,
  Sports: <HiTrophy style={{ color: '#d97706' }} />,
  'Arts & Culture': <HiPaintBrush style={{ color: '#db2777' }} />,
  Art: <HiPaintBrush style={{ color: '#db2777' }} />,
};

const CITY_TABS = [
  { id: '',          name: 'All Locations', short: 'ALL', icon: <HiGlobeAmericas /> },
  { id: 'Hyderabad', name: 'Hyderabad',     short: 'HYD', icon: <HiMapPin /> },
  { id: 'Bangalore', name: 'Bengaluru',     short: 'BLR', icon: <HiMapPin /> },
  { id: 'Mumbai',    name: 'Mumbai',        short: 'BOM', icon: <HiMapPin /> },
  { id: 'New Delhi', name: 'New Delhi',     short: 'DEL', icon: <HiMapPin /> },
];

function EventCard({ event }: { event: Event }) {
  const navigate = useNavigate();
  const date = new Date(event.dateTime);
  const isSoldOut = event.availableSeats === 0;
  const [imgSrc, setImgSrc] = useState(getEventImage(event.imageUrl, event.category?.name));

  useEffect(() => {
    setImgSrc(getEventImage(event.imageUrl, event.category?.name));
  }, [event.imageUrl, event.category?.name]);

  return (
    <div className="event-card" onClick={() => navigate(`/events/${event.id}`)} style={{ cursor: 'pointer' }}>
      <div className="event-card-img-wrap">
        <img
          src={imgSrc}
          alt={event.title}
          onError={() => setImgSrc(getCategoryFallback(event.category?.name))}
        />
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <span className={`badge ${isSoldOut ? 'badge-rose' : 'badge-green'}`}>
            {isSoldOut ? 'Sold Out' : `${event.availableSeats} left`}
          </span>
        </div>
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            {CATEGORY_ICON[event.category?.name ?? '']}
            <span>{event.category?.name ?? 'Event'}</span>
          </span>
        </div>
      </div>

      <div style={{ padding: '18px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f8fafc', marginBottom: 8, lineHeight: 1.3 }}>
          {event.title}
        </h3>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
          <HiCalendar style={{ color: '#34d399', flexShrink: 0 }} />
          <span>
            {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </p>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <HiMapPin style={{ color: '#22d3ee', flexShrink: 0 }} />
          <span>{event.venue?.name}, {event.venue?.city}</span>
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 14, borderTop: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <span style={{ fontSize: 19, fontWeight: 800, color: '#34d399' }}>
            {event.price === 0 ? 'Free' : `₹${event.price.toLocaleString('en-IN')}`}
          </span>
          <button
            className="btn btn-primary btn-sm"
            disabled={isSoldOut}
            onClick={e => { e.stopPropagation(); navigate(`/events/${event.id}`); }}
          >
            <HiTicket />
            <span>{isSoldOut ? 'Sold Out' : 'Book'}</span>
            <HiArrowRight style={{ fontSize: 12 }} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EventListingPage() {
  const [searchParams] = useSearchParams();
  const { selectedCity, setSelectedCity, searchQuery } = useCity();
  const [search, setSearch] = useState(searchParams.get('search') ?? searchQuery);
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'dateTime');
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (searchQuery !== undefined) {
      setSearch(searchQuery);
    }
  }, [searchQuery]);

  const queryParams = {
    ...(search && { search }),
    ...(selectedCity && { city: selectedCity }),
    sort,
    page,
    size: 6, // 6 events per page ensures multi-page pagination across our events
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['events', queryParams],
    queryFn: () => eventService.getEvents(queryParams),
    retry: false,
  });

  const events     = data?.data?.content       ?? [];
  const totalPages = data?.data?.totalPages    ?? 0;
  const totalItems = data?.data?.totalElements ?? 0;

  // Scroll to top smoothly when navigating pages
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  return (
    <CustomerLayout>
      <div className="container-app page-container" style={{ maxWidth: 1240 }}>
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <h1 style={{ fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 800, color: '#f8fafc', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
              <HiCalendar style={{ color: '#22d3ee' }} />
              <span>Discover Events</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 15 }}>
              {isLoading
                ? 'Loading events…'
                : selectedCity
                  ? `Showing ${events.length} of ${totalItems} events in ${selectedCity === 'Bangalore' ? 'Bengaluru' : selectedCity} (Page ${page + 1} of ${Math.max(1, totalPages)})`
                  : `Showing ${events.length} of ${totalItems} events across all locations (Page ${page + 1} of ${Math.max(1, totalPages)})`}
            </p>
          </div>

          {/* Quick Search & Sort Controls */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: 230 }}>
              <input
                id="search-events"
                type="text"
                className="input"
                placeholder="Search events…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(0); }}
                style={{ paddingLeft: 38, fontSize: 13, height: 42 }}
              />
              <HiMagnifyingGlass style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 16 }} />
              {search && (
                <button
                  onClick={() => { setSearch(''); setPage(0); }}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 14 }}
                  aria-label="Clear search"
                >
                  <HiXMark />
                </button>
              )}
            </div>

            <select
              id="sort-events"
              className="input"
              value={sort}
              onChange={e => { setSort(e.target.value); setPage(0); }}
              style={{ fontSize: 13, width: 'auto', minWidth: 175, height: 42 }}
            >
              <option value="dateTime">Date (Earliest First)</option>
              <option value="price">Price (Low to High)</option>
              <option value="price,desc">Price (High to Low)</option>
              <option value="title">Title (A → Z)</option>
            </select>
          </div>
        </div>

        {/* ── City / State Filter Tabs ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 32,
          overflowX: 'auto',
          paddingBottom: 6,
          WebkitOverflowScrolling: 'touch',
        }}>
          {CITY_TABS.map(city => {
            const isSelected = selectedCity === city.id;
            return (
              <button
                key={city.id}
                onClick={() => { setSelectedCity(city.id); setPage(0); }}
                className="filter-chip"
                style={{
                  padding: '9px 18px',
                  fontSize: 14,
                  fontWeight: 700,
                  borderRadius: 999,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  background: isSelected ? 'linear-gradient(135deg, #10B981 0%, #0D9488 100%)' : 'rgba(13, 30, 24, 0.85)',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  border: isSelected ? '1px solid #10B981' : '1px solid var(--border-subtle)',
                  boxShadow: isSelected ? '0 4px 16px rgba(16, 185, 129, 0.4)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{city.icon}</span>
                <span>{city.name}</span>
                {city.id ? (
                  <span style={{
                    fontSize: 11,
                    padding: '2px 7px',
                    borderRadius: 999,
                    background: isSelected ? 'rgba(255,255,255,0.22)' : 'rgba(16, 185, 129, 0.15)',
                    color: isSelected ? '#ffffff' : '#34d399',
                    fontWeight: 800
                  }}>
                    {city.short}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* ── All Events Grid (Full Width) ── */}
        <div>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
              <div className="spinner" style={{ width: 44, height: 44 }} />
            </div>
          ) : isError ? (
            <div className="state-box" style={{ background: 'rgba(248, 113, 113, 0.1)', borderColor: 'rgba(248, 113, 113, 0.3)' }}>
              <div style={{ fontSize: 44, color: '#f87171', marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                <HiExclamationTriangle />
              </div>
              <h3 style={{ color: '#f87171', fontWeight: 700, marginBottom: 8 }}>Failed to load events</h3>
              <p style={{ fontSize: 14, color: '#94a3b8' }}>Please verify the backend connection.</p>
            </div>
          ) : events.length === 0 ? (
            <div className="state-box">
              <div className="state-icon">
                <HiMapPin />
              </div>
              <h3 style={{ fontSize: 20, color: '#f8fafc', marginBottom: 8 }}>
                No events found {selectedCity ? `in ${selectedCity}` : ''}
              </h3>
              <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>
                Try selecting "All Locations" or search with a different keyword.
              </p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => { setSelectedCity(''); setSearch(''); setPage(0); }}
              >
                View All Events
              </button>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
                gap: 26,
              }}>
                {events.map(event => <EventCard key={event.id} event={event} />)}
              </div>

              {/* ── Pagination Bar ── */}
              {totalPages > 1 && (
                <div className="pagination-container" style={{ marginTop: 48, justifyContent: 'center' }}>
                  <button
                    className="pagination-btn"
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    aria-label="Previous page"
                  >
                    <HiChevronLeft />
                    <span>Prev</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`pagination-btn ${page === i ? 'active' : ''}`}
                      onClick={() => setPage(i)}
                      style={{ minWidth: 40, height: 40, fontWeight: 700 }}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    className="pagination-btn"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    aria-label="Next page"
                  >
                    <span>Next</span>
                    <HiChevronRight />
                  </button>

                  <span className="pagination-info" style={{ marginLeft: 8 }}>
                    Page {page + 1} of {totalPages} ({totalItems} total)
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
