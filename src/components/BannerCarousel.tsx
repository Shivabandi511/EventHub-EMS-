import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

interface BannerSlide {
  id: number;
  title: string;
  tagline: string;
  badge: string;
  date: string;
  venue: string;
  bgGradient: string;
  buttonText: string;
  linkToEventId?: number;
}

const BANNERS: BannerSlide[] = [
  {
    id: 1,
    title: "8th Edition of TSFA - Social Media & Film Awards",
    tagline: "India's Biggest Social Media Influencers & Filmmakers Summit · Nominations Open!",
    badge: "IndiaJoy 2026 Presents",
    date: "Last Date: 30 November 2026",
    venue: "HITEX Exhibition Center, Hyderabad",
    bgGradient: "linear-gradient(135deg, #091E3A 0%, #2F80ED 50%, #2D9CDB 100%)",
    buttonText: "Nominate Now!",
    linkToEventId: 1
  },
  {
    id: 2,
    title: "Global Tech Summit 2026 - Next-Gen AI & Cloud",
    tagline: "50+ Global Keynotes, 120+ VC Investors & Live Hackathons",
    badge: "Premier Tech Event",
    date: "10 - 12 Nov 2026 · 10:00 AM",
    venue: "HITEX Exhibition Center, Hyderabad",
    bgGradient: "linear-gradient(135deg, #064E3B 0%, #0D9488 55%, #10B981 100%)",
    buttonText: "Book Tickets",
    linkToEventId: 2
  },
  {
    id: 3,
    title: "Run For Child Health & Hyderabad Midnight Marathon",
    tagline: "10K Run · 5K Run · 3K Walk · Join 15,000+ Runners for a noble cause!",
    badge: "Health & Fitness 2026",
    date: "29 Nov 2026 · Sunday 5:00 AM",
    venue: "Necklace Road & Sanjeevaiah Park, Hyderabad",
    bgGradient: "linear-gradient(135deg, #064E3B 0%, #059669 50%, #10B981 100%)",
    buttonText: "Register Now",
    linkToEventId: 3
  },
  {
    id: 4,
    title: "Sunburn Arena & Symphony of Lights Live Concert",
    tagline: "International Electronic Artists & Live Orchestral Fusion",
    badge: "Music & Entertainment",
    date: "15 Dec 2026 · 6:00 PM Onwards",
    venue: "GMR Arena & HITEX, Hyderabad",
    bgGradient: "linear-gradient(135deg, #4A0E4E 0%, #831843 50%, #BE185D 100%)",
    buttonText: "Get Passes",
    linkToEventId: 4
  }
];

export default function BannerCarousel() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrent(prev => (prev - 1 + BANNERS.length) % BANNERS.length);
  };

  const nextSlide = () => {
    setCurrent(prev => (prev + 1) % BANNERS.length);
  };

  const slide = BANNERS[current];

  return (
    <div style={{ position: 'relative', width: '100%', marginBottom: 36 }}>
      {/* Banner Box */}
      <div 
        onClick={() => slide.linkToEventId ? navigate(`/events/${slide.linkToEventId}`) : null}
        style={{
          width: '100%',
          minHeight: 260,
          borderRadius: 20,
          background: slide.bgGradient,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          padding: '36px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.3)',
          transition: 'background 0.5s ease',
        }}
      >
        {/* Decorative ambient lights */}
        <div style={{
          position: 'absolute', top: -50, right: -50, width: 250, height: 250,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: -50, left: 100, width: 200, height: 200,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Content */}
        <div style={{ maxWidth: 760, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-block', marginBottom: 12 }}>
            <span style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              padding: '5px 14px',
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              {slide.badge}
            </span>
          </div>

          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(22px, 3.5vw, 36px)',
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.2,
            margin: '0 0 10px 0',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            {slide.title}
          </h2>

          <p style={{
            fontSize: 'clamp(13px, 1.6vw, 16px)',
            color: '#F1F5F9',
            margin: '0 0 18px 0',
            fontWeight: 500,
            textShadow: '0 1px 4px rgba(0,0,0,0.2)'
          }}>
            {slide.tagline}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: '#FEF08A', fontWeight: 600 }}>
              📅 {slide.date}
            </span>
            <span style={{ fontSize: 13, color: '#E2E8F0', fontWeight: 500 }}>
              📍 {slide.venue}
            </span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); navigate(`/events`); }}
              style={{
                marginLeft: 'auto',
                background: '#FBBF24',
                color: '#78350F',
                border: 'none',
                padding: '9px 24px',
                borderRadius: 9999,
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4)',
                transition: 'transform 0.15s ease'
              }}
            >
              {slide.buttonText}
            </button>
          </div>
        </div>
      </div>

      {/* Prev / Next Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        style={{
          position: 'absolute',
          left: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 5,
          backdropFilter: 'blur(4px)',
          fontSize: 18,
          transition: 'all 0.2s'
        }}
      >
        <HiChevronLeft />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next slide"
        style={{
          position: 'absolute',
          right: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 5,
          backdropFilter: 'blur(4px)',
          fontSize: 18,
          transition: 'all 0.2s'
        }}
      >
        <HiChevronRight />
      </button>

      {/* Slide Dots */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 8,
        zIndex: 5
      }}>
        {BANNERS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            style={{
              width: current === idx ? 24 : 8,
              height: 8,
              borderRadius: 9999,
              background: current === idx ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
    </div>
  );
}

