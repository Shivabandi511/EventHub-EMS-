import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  HiCalendar,
  HiChevronLeft,
  HiChevronRight,
  HiAdjustmentsHorizontal,
  HiExclamationTriangle,
  HiArrowPath,
  HiArrowsUpDown,
  HiArrowRight
} from 'react-icons/hi2';
import { eventService, categoryService, type Event } from '../services/eventService';
import CustomerLayout from '../layouts/CustomerLayout';
import { useCity } from '../context/CityContext';
import { getEventImage, getCategoryFallback } from '../assets/images';
import FilterModal from '../components/FilterModal';
import BannerCarousel from '../components/BannerCarousel';

type DateFilterType = 'ALL' | 'TODAY' | 'TOMORROW' | 'THIS_WEEKEND' | 'THIS_WEEK' | 'THIS_MONTH';

// MeraEvents-style Portrait Poster Card
function MeraEventCard({ event }: { event: Event }) {
  const navigate = useNavigate();
  const date = new Date(event.dateTime);
  const seatsLeft = event.availableSeats;
  const isSoldOut = seatsLeft === 0;
  const [imgSrc, setImgSrc] = useState(getEventImage(event.imageUrl, event.category?.name));

  useEffect(() => {
    setImgSrc(getEventImage(event.imageUrl, event.category?.name));
  }, [event.imageUrl, event.category?.name]);

  // Format Date to match MeraEvents (e.g. "28 Nov · Sat · 10:00 am")
  const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' });
  const dayDate = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div
      onClick={() => navigate(`/events/${event.id}`)}
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1.5px solid #E2E8F0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
      }}
    >
      {/* Poster Image (Tall Portrait Aspect Ratio) */}
      <div style={{ position: 'relative', width: '100%', height: 260, background: '#F1F5F9', overflow: 'hidden' }}>
        <img
          src={imgSrc}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setImgSrc(getCategoryFallback(event.category?.name))}
        />
        {/* Category Badge */}
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <span style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(4px)',
            color: '#1E1B4B',
            fontSize: 11,
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 6,
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}>
            {event.category?.name ?? 'Event'}
          </span>
        </div>

        {/* Free / Sold Out Badge */}
        {event.price === 0 && (
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <span style={{
              background: '#10B981',
              color: '#FFFFFF',
              fontSize: 11,
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: 6,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              FREE
            </span>
          </div>
        )}
        {isSoldOut && (
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <span style={{
              background: '#EF4444',
              color: '#FFFFFF',
              fontSize: 11,
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: 6,
            }}>
              SOLD OUT
            </span>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div style={{ padding: '16px 16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Title (2 lines clamp) */}
        <h3 style={{
          fontSize: 15,
          fontWeight: 700,
          color: '#0F172A',
          margin: '0 0 8px 0',
          lineHeight: 1.35,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: 40
        }}>
          {event.title}
        </h3>

        {/* Date line */}
        <p style={{
          fontSize: 12.5,
          color: '#64748B',
          margin: '0 0 5px 0',
          fontWeight: 500
        }}>
          {dayDate} · {dayName} · {timeStr}
        </p>

        {/* Venue line */}
        <p style={{
          fontSize: 12.5,
          color: '#64748B',
          margin: '0 0 16px 0',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {event.venue?.name ? `${event.venue.name}, ${event.venue.city}` : 'Venue to be announced'}
        </p>

        {/* Bottom line: Price & Get Tickets */}
        <div style={{
          marginTop: 'auto',
          paddingTop: 12,
          borderTop: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
              {event.price === 0 ? 'FREE' : `₹${event.price.toLocaleString('en-IN')}`}
            </span>
            {event.price > 0 && (
              <span style={{ fontSize: 11.5, color: '#64748B', marginLeft: 4, fontWeight: 500 }}>
                onwards
              </span>
            )}
          </div>

          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#10B981',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            <span>Get tickets</span>
            <HiArrowRight style={{ fontSize: 12 }} />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { selectedCity, setSelectedCity, searchQuery } = useCity();
  const [selectedCatId, setSelectedCatId] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('ALL');
  const [priceFilter, setPriceFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('dateTime,asc');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [page, setPage] = useState(0);

  // Fetch events
  const { data: eventsData, isLoading: eventsLoading, isError } = useQuery({
    queryKey: ['home-events'],
    queryFn: () => eventService.getEvents({ size: 100 }),
    retry: false,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
    retry: false,
  });

  const allEvents: Event[] = useMemo(() => eventsData?.data?.content ?? [], [eventsData]);
  const categories = categoriesData?.data ?? [];

  const cityMatch = (venueCity = '', targetCity = ''): boolean => {
    if (!targetCity) return true;
    const vc = venueCity.toLowerCase().trim();
    const tc = targetCity.toLowerCase().trim();
    if (vc === tc) return true;
    if (tc === 'bengaluru' || tc === 'bangalore') {
      return vc.includes('bangalore') || vc.includes('bengaluru') || vc.includes('blr');
    }
    if (tc === 'hyderabad') {
      return vc.includes('hyderabad') || vc.includes('hyd');
    }
    if (tc === 'mumbai') {
      return vc.includes('mumbai') || vc.includes('bombay');
    }
    if (tc === 'new delhi' || tc === 'delhi') {
      return vc.includes('delhi');
    }
    return vc.includes(tc);
  };

  const checkDateFilter = (dateTimeStr: string, filter: DateFilterType): boolean => {
    if (filter === 'ALL') return true;
    const d = new Date(dateTimeStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round((eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    switch (filter) {
      case 'TODAY':
        return diffDays === 0;
      case 'TOMORROW':
        return diffDays === 1;
      case 'THIS_WEEKEND': {
        const dayOfWeek = eventDay.getDay(); // 0 is Sunday, 6 is Saturday
        return (dayOfWeek === 0 || dayOfWeek === 6) && diffDays >= 0 && diffDays <= 7;
      }
      case 'THIS_WEEK':
        return diffDays >= 0 && diffDays <= 7;
      case 'THIS_MONTH':
        return diffDays >= 0 && diffDays <= 30;
      default:
        return true;
    }
  };

  const filteredEvents = useMemo(() => {
    return allEvents.filter(ev => {
      // 1. City Filter: Strictly enforce the selected city (e.g. Bengaluru, Hyderabad, Mumbai, New Delhi)
      if (selectedCity && !cityMatch(ev.venue?.city, selectedCity)) {
        return false;
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = ev.title.toLowerCase().includes(q);
        const matchesDesc = (ev.description ?? '').toLowerCase().includes(q);
        const matchesCat = (ev.category?.name ?? '').toLowerCase().includes(q);
        const matchesVenue = (ev.venue?.name ?? '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesVenue) return false;
      }

      // 3. Category Filter
      if (selectedCatId !== 'ALL' && String(ev.category?.id) !== selectedCatId) {
        return false;
      }

      // 4. Date Filter
      if (!checkDateFilter(ev.dateTime, dateFilter)) {
        return false;
      }

      // 5. Price Filter
      if (priceFilter === 'FREE' && ev.price > 0) return false;
      if (priceFilter === 'UNDER_500' && ev.price >= 500) return false;
      if (priceFilter === '500_2000' && (ev.price < 500 || ev.price > 2000)) return false;
      if (priceFilter === 'OVER_2000' && ev.price <= 2000) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'dateTime,asc') return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
      if (sortBy === 'dateTime,desc') return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
      if (sortBy === 'price,asc') return a.price - b.price;
      if (sortBy === 'price,desc') return b.price - a.price;
      return 0;
    });
  }, [allEvents, selectedCity, searchQuery, selectedCatId, dateFilter, priceFilter, sortBy]);

  useEffect(() => {
    setPage(0);
  }, [selectedCity, searchQuery, selectedCatId, dateFilter, priceFilter, sortBy]);

  // 8 events per page for a balanced 4x2 grid
  const pageSize = 8;
  const totalPages = Math.ceil(filteredEvents.length / pageSize) || 1;
  const pagedEvents = filteredEvents.slice(page * pageSize, (page + 1) * pageSize);

  const resetAllFilters = () => {
    setSelectedCatId('ALL');
    setDateFilter('ALL');
    setPriceFilter('ALL');
    setSortBy('dateTime,asc');
    setIsFilterModalOpen(false);
  };

  const hasActiveFilters = selectedCatId !== 'ALL' || dateFilter !== 'ALL' || priceFilter !== 'ALL' || sortBy !== 'dateTime,asc';

  return (
    <CustomerLayout>
      <div className="container-app" style={{ maxWidth: 1240, padding: '28px 16px 64px' }}>
        {/* ── Featured Banner Carousel ── */}
        <BannerCarousel />

        {/* ── MeraEvents Header with Sort Dropdown ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(24px, 3.5vw, 32px)',
              fontWeight: 800,
              color: '#0F172A',
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'baseline',
              gap: 8
            }}>
              <span>Events in {selectedCity || 'All Locations'}</span>
              <span style={{ fontSize: '0.6em', color: '#64748B', fontWeight: 600 }}>
                · {filteredEvents.length}
              </span>
            </h1>
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 600,
              color: '#334155'
            }}>
              <HiArrowsUpDown style={{ fontSize: 14, color: '#10B981' }} />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#0F172A',
                  fontWeight: 600,
                  fontSize: 13,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="dateTime,asc">Recommended</option>
                <option value="dateTime,asc">Date: Soonest</option>
                <option value="dateTime,desc">Date: Latest</option>
                <option value="price,asc">Price: Low to High</option>
                <option value="price,desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── MeraEvents Filter Chips Row ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            overflowX: 'auto',
            paddingBottom: 12,
            marginBottom: 28,
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
          }}
        >
          {/* All filters button */}
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 9999,
              background: hasActiveFilters ? '#10B981' : '#FFFFFF',
              border: hasActiveFilters ? '1.5px solid #10B981' : '1.5px solid #E2E8F0',
              color: hasActiveFilters ? '#FFFFFF' : '#334155',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease'
            }}
          >
            <HiAdjustmentsHorizontal style={{ fontSize: 16 }} />
            <span>All filters</span>
            {hasActiveFilters && (
              <span style={{
                background: '#FFFFFF',
                color: '#10B981',
                borderRadius: '50%',
                width: 16,
                height: 16,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 800,
              }}>
                !
              </span>
            )}
          </button>

          {/* Quick Date Filters */}
          {[
            { id: 'ALL', label: 'All Dates' },
            { id: 'TODAY', label: 'Today' },
            { id: 'TOMORROW', label: 'Tomorrow' },
            { id: 'THIS_WEEKEND', label: 'This Weekend' },
            { id: 'THIS_WEEK', label: 'This Week' },
            { id: 'THIS_MONTH', label: 'This Month' },
          ].map(df => {
            const active = dateFilter === df.id;
            return (
              <button
                key={df.id}
                type="button"
                onClick={() => setDateFilter(df.id as DateFilterType)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 9999,
                  background: active ? '#10B981' : '#FFFFFF',
                  border: active ? '1.5px solid #10B981' : '1.5px solid #E2E8F0',
                  color: active ? '#FFFFFF' : '#334155',
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'all 0.15s ease'
                }}
              >
                {df.label}
              </button>
            );
          })}

          <div style={{ width: 1, height: 22, background: '#E2E8F0', flexShrink: 0, margin: '0 4px' }} />

          {/* Category Chips */}
          {categories.map(cat => {
            const active = selectedCatId === String(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCatId(active ? 'ALL' : String(cat.id))}
                style={{
                  padding: '8px 16px',
                  borderRadius: 9999,
                  background: active ? '#10B981' : '#FFFFFF',
                  border: active ? '1.5px solid #10B981' : '1.5px solid #E2E8F0',
                  color: active ? '#FFFFFF' : '#334155',
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* ── 4-Column Portrait Event Cards Grid ── */}
        {eventsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
            <div className="spinner" style={{ width: 44, height: 44, borderColor: 'rgba(16, 185, 129, 0.3)', borderTopColor: '#10B981' }} />
          </div>
        ) : isError ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0' }}>
            <HiExclamationTriangle style={{ fontSize: 44, color: '#EF4444', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Unable to load events</h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>Please check your network connection and try again.</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 20px',
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1.5px dashed #CBD5E1',
              margin: '20px 0'
            }}
          >
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: '#ECFDF5',
              color: '#10B981', fontSize: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px'
            }}>
              <HiCalendar />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
              No events found in {selectedCity || 'this filter'}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14, maxWidth: 440, margin: '0 auto 24px', lineHeight: 1.6 }}>
              We couldn't find any events matching your selected criteria. Try exploring events in Hyderabad or view all locations.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setSelectedCity('Hyderabad')}
                style={{
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#FFFFFF',
                  padding: '10px 22px',
                  borderRadius: 8,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}
              >
                <span>View Hyderabad Events</span>
              </button>
              <button
                type="button"
                onClick={() => { setSelectedCity(''); resetAllFilters(); }}
                style={{
                  background: '#FFFFFF',
                  color: '#334155',
                  padding: '10px 22px',
                  borderRadius: 8,
                  fontWeight: 600,
                  border: '1.5px solid #E2E8F0',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <HiArrowPath />
                <span>Show All Cities</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 22
            }}>
              {pagedEvents.map((event: Event) => (
                <MeraEventCard key={event.id} event={event} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 48,
                flexWrap: 'wrap'
              }}>
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1.5px solid #E2E8F0',
                    background: '#FFFFFF',
                    color: page === 0 ? '#94A3B8' : '#1E293B',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: page === 0 ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <HiChevronLeft /> Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      border: page === i ? '1.5px solid #10B981' : '1.5px solid #E2E8F0',
                      background: page === i ? '#10B981' : '#FFFFFF',
                      color: page === i ? '#FFFFFF' : '#334155',
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: 'pointer'
                    }}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1.5px solid #E2E8F0',
                    background: '#FFFFFF',
                    color: page >= totalPages - 1 ? '#94A3B8' : '#1E293B',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  Next <HiChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        categories={categories}
        selectedCatId={selectedCatId}
        setSelectedCatId={setSelectedCatId}
        priceFilter={priceFilter}
        setPriceFilter={setPriceFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onReset={resetAllFilters}
      />
    </CustomerLayout>
  );
}
