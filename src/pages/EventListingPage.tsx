import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventService, categoryService, type Event, type Category } from '../services/eventService';
import CustomerLayout from '../layouts/CustomerLayout';

const CATEGORIES_EMOJI: Record<string, string> = {
  Music: '🎵', Tech: '💻', Sports: '⚽', Art: '🎨', Food: '🍽️',
  Business: '💼', Education: '📚', Health: '❤️', Comedy: '😄', Dance: '💃',
};

function EventCard({ event }: { event: Event }) {
  const navigate = useNavigate();
  const date = new Date(event.dateTime);
  const isSoldOut = event.availableSeats === 0;

  return (
    <div className="event-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/events/${event.id}`)}>
      <div style={{
        height: 170, background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderBottom: '1px solid #e2e8f0',
      }}>
        {event.imageUrl
          ? <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 48 }}>{CATEGORIES_EMOJI[event.category?.name] ?? '🎭'}</span>}
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <span className={`badge ${isSoldOut ? 'badge-red' : 'badge-green'}`}>
            {isSoldOut ? 'Sold Out' : `${event.availableSeats} left`}
          </span>
        </div>
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <span className="badge badge-purple">{event.category?.name ?? 'Event'}</span>
        </div>
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 8, lineHeight: 1.3 }}>
          {event.title}
        </h3>
        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 3 }}>
          📅 {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>📍 {event.venue?.name}, {event.venue?.city}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#2563eb' }}>
            {event.price === 0 ? 'Free' : `₹${event.price.toLocaleString('en-IN')}`}
          </span>
          <button
            className="btn btn-primary btn-sm"
            disabled={isSoldOut}
            onClick={e => { e.stopPropagation(); navigate(`/events/${event.id}`); }}
          >
            {isSoldOut ? 'Sold Out' : 'Book →'}
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
      <div className="container-app" style={{ padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
            Browse Events
          </h1>
          <p style={{ color: '#64748b', fontSize: 15 }}>
            {isLoading ? 'Loading…' : `${totalItems} event${totalItems !== 1 ? 's' : ''} found`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
          {/* ── Filters Sidebar ── */}
          <aside style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>🔍 Filters</h3>
                {hasFilters && (
                  <button onClick={clearFilters} style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Clear all</button>
                )}
              </div>

              {/* Search */}
              <div style={{ marginBottom: 16 }}>
                <label className="label">Search</label>
                <input
                  id="filter-search" className="input" placeholder="Event name…"
                  value={filters.search}
                  onChange={e => applyFilter('search', e.target.value)}
                  style={{ fontSize: 13 }}
                />
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
                <label className="label">City</label>
                <input
                  id="filter-city" className="input" placeholder="e.g. Hyderabad"
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
                  <label className="label">Min ₹</label>
                  <input id="filter-minprice" className="input" type="number" min="0" placeholder="0" value={filters.minPrice} onChange={e => applyFilter('minPrice', e.target.value)} style={{ fontSize: 13 }} />
                </div>
                <div>
                  <label className="label">Max ₹</label>
                  <input id="filter-maxprice" className="input" type="number" min="0" placeholder="∞" value={filters.maxPrice} onChange={e => applyFilter('maxPrice', e.target.value)} style={{ fontSize: 13 }} />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="label">Sort by</label>
                <select id="filter-sort" className="input" value={filters.sort} onChange={e => applyFilter('sort', e.target.value)} style={{ fontSize: 13 }}>
                  <option value="dateTime">Date (Earliest)</option>
                  <option value="price">Price (Low→High)</option>
                  <option value="price,desc">Price (High→Low)</option>
                  <option value="title">Name (A→Z)</option>
                </select>
              </div>
            </div>
          </aside>

          {/* ── Events Grid ── */}
          <div style={{ flex: 1 }}>
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                <div className="spinner" style={{ width: 44, height: 44 }} />
              </div>
            ) : isError ? (
              <div style={{
                textAlign: 'center', padding: 60,
                background: '#fef2f2', borderRadius: 16, border: '1px dashed #fecaca',
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
                <h3 style={{ fontFamily: 'Outfit,sans-serif', color: '#b91c1c', marginBottom: 8 }}>Failed to load events</h3>
                <p style={{ fontSize: 14, color: '#64748b' }}>Make sure the backend is running on port 8080.</p>
              </div>
            ) : events.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: 80,
                background: '#ffffff', borderRadius: 16, border: '1px dashed #cbd5e1',
              }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
                <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, color: '#0f172a', marginBottom: 8 }}>No events found</h3>
                <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Try adjusting your filters.</p>
                <button className="btn btn-secondary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                  {events.map(event => <EventCard key={event.id} event={event} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 40 }}>
                    <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
                    <span style={{ fontSize: 13, color: '#64748b', padding: '0 12px' }}>Page {page + 1} of {totalPages}</span>
                    <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
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
