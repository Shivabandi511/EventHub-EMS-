import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  HiCalendarDays, 
  HiMapPin, 
  HiTicket, 
  HiArrowLeft, 
  HiArrowUpTray,
  HiHeart,
  HiFlag,
  HiChatBubbleLeftEllipsis,
  HiExclamationTriangle,
  HiArrowTopRightOnSquare,
  HiCheck
} from 'react-icons/hi2';
import { eventService } from '../services/eventService';
import { useState, useEffect } from 'react';
import CustomerLayout from '../layouts/CustomerLayout';
import { useAuth } from '../context/AuthContext';
import { getEventImage, getCategoryFallback } from '../assets/images';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [isInterested, setIsInterested] = useState(false);
  const [interestCount, setInterestCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getEvent(Number(id)),
    enabled: !!id,
  });

  const event = data?.data;

  const [imgSrc, setImgSrc] = useState(getEventImage(event?.imageUrl, event?.category?.name));

  useEffect(() => {
    if (event) {
      setImgSrc(getEventImage(event.imageUrl, event.category?.name));
    }
  }, [event]);

  if (isLoading) return (
    <CustomerLayout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 500 }}>
        <div className="spinner" style={{ width: 48, height: 48 }} />
      </div>
    </CustomerLayout>
  );

  if (isError || !event) return (
    <CustomerLayout>
      <div style={{
        maxWidth: 480,
        margin: '80px auto',
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid #E2E8F0',
        padding: 40,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 48, color: '#EF4444', marginBottom: 16 }}>
          <HiExclamationTriangle />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Event Not Found</h2>
        <p style={{ color: '#64748B', fontSize: 14, marginBottom: 24 }}>This event may have been removed or does not exist.</p>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 22px',
            borderRadius: 8,
            background: '#7C3AED',
            color: '#FFFFFF',
            fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          <HiArrowLeft />
          <span>Browse Events</span>
        </Link>
      </div>
    </CustomerLayout>
  );

  const eventDate = new Date(event.dateTime);
  const isSoldOut = event.availableSeats === 0;
  const isCancelled = event.status === 'CANCELLED';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out ${event.title} on EventHub!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleInterestToggle = () => {
    if (!isInterested) {
      setIsInterested(true);
      setInterestCount(prev => prev + 1);
    } else {
      setIsInterested(false);
      setInterestCount(prev => Math.max(0, prev - 1));
    }
  };

  const hostName = event.venue?.name ? `${event.venue.name} Org` : 'Kalaraj Media & Entertainment';
  const hostInitials = hostName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  // Format date range: e.g. Mon, Nov 02, 3:25 PM
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const fullDateTimeDisplay = `${formattedDate}, ${formattedTime}`;

  return (
    <CustomerLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 80px', width: '100%' }}>
        {/* ── Breadcrumb & Action Row (Matching MeraEvents top bar) ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20
        }}>
          {/* Breadcrumb links */}
          <nav style={{
            fontSize: 13,
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexWrap: 'wrap'
          }}>
            <Link to="/" style={{ color: '#64748B', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link to="/" style={{ color: '#64748B', textDecoration: 'none' }}>
              {event.category?.name || 'Entertainment & Shows'}
            </Link>
            <span>›</span>
            <span style={{
              color: '#0F172A',
              fontWeight: 500,
              maxWidth: 280,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {event.title}
            </span>
          </nav>

          {/* Right interest & share controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#64748B' }} className="hidden-mobile">
              {interestCount > 0 ? `${interestCount} people interested` : 'Be the first to show interest'}
            </span>

            {/* I'm Interested Button */}
            <button
              type="button"
              onClick={handleInterestToggle}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                borderRadius: 8,
                background: isInterested ? '#FDF2F8' : '#FFFFFF',
                border: isInterested ? '1.5px solid #F472B6' : '1.5px solid #E2E8F0',
                color: isInterested ? '#DB2777' : '#1E293B',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <HiHeart style={{ fontSize: 16, color: isInterested ? '#EC4899' : '#94A3B8' }} />
              <span>{isInterested ? 'Interested' : "I'm Interested"}</span>
            </button>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Share event"
            >
              {copied ? <HiCheck style={{ color: '#10B981', fontSize: 16 }} /> : <HiArrowUpTray style={{ fontSize: 16 }} />}
            </button>
          </div>
        </div>

        {/* ── Main 2-Column Content ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 380px',
          gap: 32,
          alignItems: 'start'
        }} className="event-detail-grid-responsive">
          {/* ════════ LEFT COLUMN ════════ */}
          <div>
            {/* Hero Event Banner (Wide rounded poster) */}
            <div style={{
              width: '100%',
              height: 'clamp(260px, 42vw, 420px)',
              borderRadius: 16,
              overflow: 'hidden',
              background: '#0F172A',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              position: 'relative',
              marginBottom: 24
            }}>
              <img
                src={imgSrc}
                alt={event.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => setImgSrc(getCategoryFallback(event.category?.name))}
              />

              {/* Status Badges */}
              {(isCancelled || isSoldOut) && (
                <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8 }}>
                  {isCancelled && (
                    <span style={{
                      background: '#EF4444',
                      color: '#FFFFFF',
                      padding: '4px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700
                    }}>
                      Cancelled
                    </span>
                  )}
                  {isSoldOut && !isCancelled && (
                    <span style={{
                      background: '#F59E0B',
                      color: '#FFFFFF',
                      padding: '4px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700
                    }}>
                      Sold Out
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Event Title (Bold, MeraEvents typography) */}
            <h1 style={{
              fontSize: 'clamp(22px, 3.5vw, 30px)',
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.3,
              marginBottom: 24,
              letterSpacing: '-0.01em'
            }}>
              {event.title}
            </h1>

            {/* Tab: About the Event (with active purple underline) */}
            <div style={{
              borderBottom: '1px solid #E2E8F0',
              marginBottom: 20,
              display: 'flex',
              gap: 28
            }}>
              <div style={{
                position: 'relative',
                paddingBottom: 12,
                fontSize: 17,
                fontWeight: 700,
                color: '#0F172A',
                cursor: 'pointer'
              }}>
                <span>About the Event</span>
                {/* Emerald Underline Indicator */}
                <div style={{
                  position: 'absolute',
                  bottom: -1,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: '#10B981',
                  borderRadius: '3px 3px 0 0'
                }} />
              </div>
            </div>

            {/* Event Description */}
            <div style={{ color: '#334155', fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>
              <div style={{
                maxHeight: isExpanded ? 'none' : '200px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <p style={{ whiteSpace: 'pre-line', marginBottom: 12 }}>
                  {event.description || 'Join us for this premier gathering and networking event. Experience insightful discussions, keynotes, and opportunities to connect with industry peers.'}
                </p>

                {/* Fade overlay when collapsed */}
                {!isExpanded && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 60,
                    background: 'linear-gradient(to bottom, rgba(248, 250, 252, 0), rgba(248, 250, 252, 1))'
                  }} />
                )}
              </div>

              {/* Read More / Read Less Toggle */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#10B981',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 0',
                  marginTop: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span>{isExpanded ? 'Read less ˄' : 'Read more ˅'}</span>
              </button>
            </div>

            {/* Report an issue link */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 18 }}>
              <button
                type="button"
                onClick={() => alert('Thank you for reporting. Our moderation team will review this event.')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <HiFlag style={{ fontSize: 14 }} />
                <span>Report an issue</span>
              </button>
            </div>
          </div>

          {/* ════════ RIGHT COLUMN (Sticky Booking Box & Host Details) ════════ */}
          <div style={{ position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* ── Booking Box (Matching MeraEvents right widget) ── */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1.5px solid #E2E8F0',
              padding: 24,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
            }}>
              {/* Date & Time Row */}
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 18 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: '#FDF2F8',
                  color: '#DB2777',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <HiCalendarDays style={{ fontSize: 20 }} />
                </div>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A', lineHeight: 1.4 }}>
                    {fullDateTimeDisplay}
                  </p>
                </div>
              </div>

              {/* Location Pin Row */}
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: '#FFFBEB',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <HiMapPin style={{ fontSize: 20 }} />
                </div>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A', lineHeight: 1.3, marginBottom: 2 }}>
                    {event.venue?.name || 'Location to be announced'}
                  </p>
                  <p style={{ fontSize: 12, color: '#64748B' }}>
                    {event.venue?.address ? `${event.venue.address}, ` : ''}{event.venue?.city || 'Hyderabad'}, India
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: '#F1F5F9', margin: '16px 0' }} />

              {/* Price & Ticket count */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 4 }}>
                  {event.price === 0 ? 'Free' : `₹${event.price.toLocaleString('en-IN')}`}
                </p>
                <p style={{ fontSize: 12.5, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <HiTicket style={{ fontSize: 14, color: '#10B981' }} />
                  <span>{event.availableSeats} tickets available</span>
                </p>
              </div>

              {/* Emerald Register Now Button */}
              {!isCancelled && !isSoldOut ? (
                <button
                  type="button"
                  id="btn-register-now"
                  onClick={() => {
                    if (isAuthenticated) {
                      navigate(`/booking/${event.id}`);
                    } else {
                      navigate(`/login?redirect=/booking/${event.id}`);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '13px 20px',
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Register Now
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  style={{
                    width: '100%',
                    padding: '13px 20px',
                    borderRadius: 10,
                    background: '#E2E8F0',
                    color: '#94A3B8',
                    border: 'none',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'not-allowed'
                  }}
                >
                  {isCancelled ? 'Event Cancelled' : 'Sold Out'}
                </button>
              )}
            </div>

            {/* ── Host Details Card (Matching MeraEvents Host Details) ── */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1.5px solid #E2E8F0',
              padding: 20,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
            }}>
              {/* Header: Host Details & Event ID */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', position: 'relative' }}>
                  Host Details
                  <span style={{
                    display: 'block',
                    width: 24,
                    height: 2.5,
                    background: '#10B981',
                    borderRadius: 2,
                    marginTop: 3
                  }} />
                </h3>
                <span style={{ fontSize: 12, color: '#64748B' }}>
                  Event ID: 300{String(event.id).padStart(3, '0')}
                </span>
              </div>

              {/* Host Profile Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: '#F1F5F9',
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {hostInitials}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: '#0F172A',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <span>{hostName}</span>
                      <HiArrowTopRightOnSquare style={{ fontSize: 12, color: '#94A3B8' }} />
                    </p>
                  </div>
                </div>

                {/* Follow Button */}
                <button
                  type="button"
                  onClick={() => setIsFollowing(!isFollowing)}
                  style={{
                    background: isFollowing ? '#F1F5F9' : '#0F172A',
                    color: isFollowing ? '#0F172A' : '#FFFFFF',
                    border: 'none',
                    borderRadius: 9999,
                    padding: '6px 16px',
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>

              {/* Stats */}
              <div style={{ fontSize: 12, color: '#64748B', display: 'flex', gap: 14 }}>
                <span><strong>22</strong> Events</span>
                <span>•</span>
                <span><strong>{isFollowing ? 1 : 0}</strong> Followers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating Chat Bubble (Bottom Right) ── */}
      <button
        type="button"
        onClick={() => alert('EventHub Support: How can we help you today?')}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10B981, #0D9488)',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          cursor: 'pointer',
          zIndex: 90,
          transition: 'transform 0.2s ease'
        }}
        title="Need help?"
      >
        <HiChatBubbleLeftEllipsis />
      </button>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 900px) {
          .event-detail-grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </CustomerLayout>
  );
}
