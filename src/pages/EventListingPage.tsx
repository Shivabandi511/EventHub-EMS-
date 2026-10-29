import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  HiCalendar, 
  HiMapPin, 
  HiTicket, 
  HiArrowRight, 
  HiAdjustmentsHorizontal, 
  HiMagnifyingGlass, 
  HiExclamationTriangle, 
  HiChevronLeft, 
  HiChevronRight, 
  HiXMark,
  HiCpuChip,
  HiMusicalNote,
  HiBriefcase,
  HiTrophy,
  HiPaintBrush
} from 'react-icons/hi2';
import { eventService, categoryService, type Event, type Category } from '../services/eventService';
import CustomerLayout from '../layouts/CustomerLayout';
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
  const isSoldOut = event.availableSeats === 0;
  const eventImg = getEventImage(event.imageUrl, event.category?.name);

  return (
    <div className="event-card" onClick={() => navigate(`/events/${event.id}`)} style={{ cursor: 'pointer' }}>
      <div className="event-card-img-wrap">
        <img src={eventImg} alt={event.title} />
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <span className={`badge ${isSoldOut ? 'badge-rose' : 'badge-green'}`}>
            {isSoldOut ? 'Sold Out' : `${event.availableSeats} left`}
          </span>
        </div>
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {CATEGORY_ICON[event.category?.name ?? '']}
            <span>{event.category?.name ?? 'Event'}</span>
          </span>
        </div>
      </div>

      <div style={{ padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e1b4b', marginBottom: 8, lineHeight: 1.3 }}>
          {event.title}
        </h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          <HiCalendar style={{ color: '#7c3aed', flexShrink: 0 }} />
          <span>{date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </p>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <HiMapPin style={{ color: '#e11d48', flexShrink: 0 }} />
          <span>{event.venue?.name}, {event.venue?.city}</span>
        </p>

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
  const [filters, setFilters] = useState({
    search:     searchParams.get('search')     ?? '',
    categoryId: searchParams.get('categoryId') ?? '',
    city:       searchParams.get('city')       ?? '',
    fromDate:   searchParams.get('fromDate')   ?? '',
    toDate:     searchParams.get('toDate')     ?? '',
    minPrice:   searchParams.get('minPrice')   ?? '',
    maxPrice:   searchParams.get('maxPrice')   ?? '',
    sort:       searchParams.get('sort')       ?? 'dateTime',
  });
  const [page, setPage] = useState(0);

  const queryParams = {
    ...(filters.search     && { search:     filters.search }),
    ...(filters.categoryId && { categoryId: Number(filters.categoryId) }),
    ...(filters.city       && { city:       filters.city }),
    ...(filters.fromDate   && { fromDate:   filters.fromDate }),
    ...(filters.toDate     && { toDate:     filters.toDate }),
    ...(filters.minPrice   && { minPrice:   Number(filters.minPrice) }),
    ...(filters.maxPrice   && { maxPrice:   Number(filters.maxPrice) }),
    sort: filters.sort, page, size: 9,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['events', queryParams],
    queryFn: () => eventService.getEvents(queryParams),
    retry: false,
  });

  const { data: catsData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
    retry: false,
  });

  const events     = data?.data?.content    ?? [];
  const totalPages = data?.data?.totalPages ?? 0;
  const totalItems = data?.data?.totalElements ?? 0;
  const categories = catsData?.data ?? [];

  const applyFilter = (key: string, value: string) => {
    setFilters(p => ({ ...p, [key]: value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({ search: '', categoryId: '', city: '', fromDate: '', toDate: '', minPrice: '', maxPrice: '', sort: 'dateTime' });
    setPage(0);
  };

  const hasFilters = Object.values(filters).some(v => v && v !== 'dateTime');

  return (
    <CustomerLayout>
      <div className="container-app page-container">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e1b4b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <HiCalendar style={{ color: '#7c3aed' }} />
            <span>Discover Events</span>
          </h1>
          <p style={{ color: '#6b7280', fontSize: 15 }}>
            {isLoading ? 'Loading events…' : `${totalItems} event${totalItems !== 1 ? 's' : ''} available`}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: 28, alignItems: 'start' }}>
          {/* ── Filters Sidebar ── */}
          <aside className="filter-card">
            <div className="filter-header">
              <h3 className="filter-title">
                <HiAdjustmentsHorizontal style={{ color: '#7c3aed', fontSize: 20 }} />
                <span>Filters</span>
              </h3>
              {hasFilters && (
                <button onClick={clearFilters} style={{ fontSize: 12, color: '#e11d48', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <HiXMark />
                  <span>Clear all</span>
                </button>
              )}
            </div>

            {/* Search */}
            <div style={{ marginBottom: 16 }}>
              <label className="label">Search Events</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="filter-search" className="input" placeholder="Search keywords…"
                  value={filters.search}
                  onChange={e => applyFilter('search', e.target.value)}
                  style={{ fontSize: 13, paddingLeft: 36 }}
                />
                <HiMagnifyingGlass style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 16 }} />
              </div>
            </div>

            {/* Category */}
            {categories.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <label className="label">Category</label>
                <select
                  id="filter-category" className="input"
                  value={filters.categoryId}
                  onChange={e => applyFilter('categoryId', e.target.value)}
                  style={{ fontSize: 13 }}
                >
                  <option value="">All Categories</option>
                  {categories.map((c: Category) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* City */}
            <div style={{ marginBottom: 16 }}>
              <label className="label">City / Location</label>
              <input
                id="filter-city" className="input" placeholder="e.g. Hyderabad, Bangalore"
                value={filters.city}
                onChange={e => applyFilter('city', e.target.value)}
                style={{ fontSize: 13 }}
              />
            </div>

            {/* Date range */}
            <div style={{ marginBottom: 16 }}>
              <label className="label">From Date</label>
              <input id="filter-from" className="input" type="date" value={filters.fromDate} onChange={e => applyFilter('fromDate', e.target.value)} style={{ fontSize: 13 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="label">To Date</label>
              <input id="filter-to" className="input" type="date" value={filters.toDate} onChange={e => applyFilter('toDate', e.target.value)} style={{ fontSize: 13 }} />
            </div>

            {/* Price */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <div>
                <label className="label">Min (₹)</label>
                <input id="filter-minprice" className="input" type="number" min="0" placeholder="0" value={filters.minPrice} onChange={e => applyFilter('minPrice', e.target.value)} style={{ fontSize: 13 }} />
              </div>
              <div>
                <label className="label">Max (₹)</label>
                <input id="filter-maxprice" className="input" type="number" min="0" placeholder="Max" value={filters.maxPrice} onChange={e => applyFilter('maxPrice', e.target.value)} style={{ fontSize: 13 }} />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="label">Sort By</label>
              <select id="filter-sort" className="input" value={filters.sort} onChange={e => applyFilter('sort', e.target.value)} style={{ fontSize: 13 }}>
                <option value="dateTime">Date (Earliest First)</option>
                <option value="price">Price (Low to High)</option>
                <option value="price,desc">Price (High to Low)</option>
                <option value="title">Title (A → Z)</option>
              </select>
            </div>
          </aside>

          {/* ── Events Grid ── */}
          <div>
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                <div className="spinner" style={{ width: 44, height: 44 }} />
              </div>
            ) : isError ? (
              <div className="state-box" style={{ background: '#fff1f2', borderColor: '#fecdd3' }}>
                <div style={{ fontSize: 44, color: '#e11d48', marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                  <HiExclamationTriangle />
                </div>
                <h3 style={{ color: '#be123c', fontWeight: 700, marginBottom: 8 }}>Failed to load events</h3>
                <p style={{ fontSize: 14, color: '#6b7280' }}>Please verify the backend connection.</p>
              </div>
            ) : events.length === 0 ? (
              <div className="state-box">
                <div className="state-icon">
                  <HiMagnifyingGlass />
                </div>
                <h3 style={{ fontSize: 20, color: '#1e1b4b', marginBottom: 8 }}>No events matched your search</h3>
                <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>Try relaxing your filters or searching for something else.</p>
                <button className="btn btn-secondary btn-sm" onClick={clearFilters}>Reset Filters</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 22 }}>
                  {events.map(event => <EventCard key={event.id} event={event} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination-container">
                    <button
                      className="pagination-btn"
                      disabled={page === 0}
                      onClick={() => setPage(p => p - 1)}
                    >
                      <HiChevronLeft />
                      <span>Prev</span>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        className={`pagination-btn ${page === i ? 'active' : ''}`}
                        onClick={() => setPage(i)}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      className="pagination-btn"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(p => p + 1)}
                    >
                      <span>Next</span>
                      <HiChevronRight />
                    </button>

                    <span className="pagination-info">Page {page + 1} of {totalPages}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
