import React, { useState, useMemo } from 'react';
import { 
  HiMapPin, 
  HiXMark, 
  HiMagnifyingGlass, 
  HiGlobeAlt,
  HiCheck
} from 'react-icons/hi2';
import { useCity } from '../context/CityContext';

interface MajorCity {
  id: string;
  name: string;
  svg: React.ReactElement;
}

// Custom landmark SVG illustrations matching MeraEvents visual aesthetic
const CharminarSvg = () => (
  <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="24" width="8" height="34" rx="2" fill="#F59E0B" stroke="#78350F" strokeWidth="2"/>
    <rect x="48" y="24" width="8" height="34" rx="2" fill="#F59E0B" stroke="#78350F" strokeWidth="2"/>
    <rect x="20" y="24" width="6" height="34" rx="1" fill="#D97706" stroke="#78350F" strokeWidth="1.5"/>
    <rect x="38" y="24" width="6" height="34" rx="1" fill="#D97706" stroke="#78350F" strokeWidth="1.5"/>
    {/* Minaret Domes */}
    <path d="M12 12C9 16 9 24 12 24C15 24 15 16 12 12Z" fill="#FBBF24" stroke="#78350F" strokeWidth="2"/>
    <path d="M52 12C49 16 49 24 52 24C55 24 55 16 52 12Z" fill="#FBBF24" stroke="#78350F" strokeWidth="2"/>
    {/* Main central arches & block */}
    <rect x="14" y="28" width="36" height="30" fill="#FDE68A" stroke="#78350F" strokeWidth="2"/>
    <path d="M22 58V40C22 34 42 34 42 40V58H22Z" fill="#F59E0B" stroke="#78350F" strokeWidth="2"/>
    <path d="M26 58V44C26 39 38 39 38 44V58H26Z" fill="#FEF3C7" stroke="#78350F" strokeWidth="1.5"/>
    {/* Upper gallery */}
    <rect x="12" y="22" width="40" height="6" rx="1" fill="#D97706" stroke="#78350F" strokeWidth="2"/>
    <rect x="16" y="16" width="32" height="6" fill="#FBBF24" stroke="#78350F" strokeWidth="2"/>
    {/* Center dome */}
    <path d="M32 8C27 12 27 16 32 16C37 16 37 12 32 8Z" fill="#F59E0B" stroke="#78350F" strokeWidth="2"/>
  </svg>
);

const GatewaySvg = () => (
  <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="20" width="12" height="38" rx="2" fill="#F59E0B" stroke="#78350F" strokeWidth="2"/>
    <rect x="42" y="20" width="12" height="38" rx="2" fill="#F59E0B" stroke="#78350F" strokeWidth="2"/>
    <rect x="18" y="20" width="28" height="18" fill="#FDE68A" stroke="#78350F" strokeWidth="2"/>
    {/* Arch */}
    <path d="M22 58V38C22 30 42 30 42 38V58H22Z" fill="#FEF3C7" stroke="#78350F" strokeWidth="2"/>
    {/* Cornice & parapet */}
    <rect x="8" y="16" width="48" height="6" rx="1" fill="#D97706" stroke="#78350F" strokeWidth="2"/>
    {/* Domes */}
    <path d="M16 10C13 13 13 16 16 16C19 16 19 13 16 10Z" fill="#FBBF24" stroke="#78350F" strokeWidth="1.5"/>
    <path d="M48 10C45 13 45 16 48 16C51 16 51 13 48 10Z" fill="#FBBF24" stroke="#78350F" strokeWidth="1.5"/>
    <path d="M32 8C28 11 28 16 32 16C36 16 36 11 32 8Z" fill="#FBBF24" stroke="#78350F" strokeWidth="2"/>
  </svg>
);

const IndiaGateSvg = () => (
  <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Pillars */}
    <rect x="14" y="22" width="10" height="36" fill="#F59E0B" stroke="#78350F" strokeWidth="2"/>
    <rect x="40" y="22" width="10" height="36" fill="#F59E0B" stroke="#78350F" strokeWidth="2"/>
    {/* Center Top Arch */}
    <rect x="14" y="16" width="36" height="12" fill="#FDE68A" stroke="#78350F" strokeWidth="2"/>
    <path d="M24 58V38C24 30 40 30 40 38V58H24Z" fill="#FEF3C7" stroke="#78350F" strokeWidth="2"/>
    {/* Attic & top step */}
    <rect x="18" y="10" width="28" height="6" fill="#D97706" stroke="#78350F" strokeWidth="2"/>
    <rect x="22" y="6" width="20" height="4" rx="1" fill="#FBBF24" stroke="#78350F" strokeWidth="1.5"/>
  </svg>
);

const VidhanaSoudhaSvg = () => (
  <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Base & facade */}
    <rect x="8" y="32" width="48" height="26" fill="#E2E8F0" stroke="#334155" strokeWidth="2"/>
    {/* Columns */}
    <line x1="16" y1="36" x2="16" y2="58" stroke="#64748B" strokeWidth="2"/>
    <line x1="24" y1="36" x2="24" y2="58" stroke="#64748B" strokeWidth="2"/>
    <line x1="40" y1="36" x2="40" y2="58" stroke="#64748B" strokeWidth="2"/>
    <line x1="48" y1="36" x2="48" y2="58" stroke="#64748B" strokeWidth="2"/>
    {/* Steps & porch */}
    <rect x="26" y="38" width="12" height="20" fill="#CBD5E1" stroke="#334155" strokeWidth="1.5"/>
    {/* Central Dome */}
    <path d="M32 14C24 20 24 30 32 30C40 30 40 20 32 14Z" fill="#FBBF24" stroke="#78350F" strokeWidth="2"/>
    {/* Side chhatris */}
    <path d="M14 22C11 25 11 30 14 30C17 30 17 25 14 22Z" fill="#FCD34D" stroke="#78350F" strokeWidth="1.5"/>
    <path d="M50 22C47 25 47 30 50 30C53 30 53 25 50 22Z" fill="#FCD34D" stroke="#78350F" strokeWidth="1.5"/>
  </svg>
);

const StadiumSvg = () => (
  <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="38" rx="26" ry="16" fill="#6EE7B7" stroke="#065F46" strokeWidth="2"/>
    <ellipse cx="32" cy="36" rx="20" ry="11" fill="#A7F3D0" stroke="#065F46" strokeWidth="1.5"/>
    <ellipse cx="32" cy="36" rx="12" ry="6" fill="#34D399" stroke="#065F46" strokeWidth="1"/>
    {/* Floodlights */}
    <line x1="12" y1="34" x2="10" y2="18" stroke="#065F46" strokeWidth="2"/>
    <circle cx="10" cy="16" r="3" fill="#FBBF24" stroke="#78350F" strokeWidth="1"/>
    <line x1="52" y1="34" x2="54" y2="18" stroke="#065F46" strokeWidth="2"/>
    <circle cx="54" cy="16" r="3" fill="#FBBF24" stroke="#78350F" strokeWidth="1"/>
  </svg>
);

const ShaniwarWadaSvg = () => (
  <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Fort Walls */}
    <rect x="10" y="24" width="44" height="34" fill="#E5E7EB" stroke="#374151" strokeWidth="2"/>
    {/* Wooden Spiked Delhi Gate */}
    <path d="M24 58V34C24 28 40 28 40 34V58H24Z" fill="#92400E" stroke="#451A03" strokeWidth="2"/>
    {/* Bastions */}
    <rect x="8" y="20" width="8" height="38" rx="2" fill="#D1D5DB" stroke="#374151" strokeWidth="2"/>
    <rect x="48" y="20" width="8" height="38" rx="2" fill="#D1D5DB" stroke="#374151" strokeWidth="2"/>
    {/* Crenellations */}
    <rect x="18" y="18" width="6" height="6" fill="#9CA3AF" stroke="#374151" strokeWidth="1.5"/>
    <rect x="29" y="18" width="6" height="6" fill="#9CA3AF" stroke="#374151" strokeWidth="1.5"/>
    <rect x="40" y="18" width="6" height="6" fill="#9CA3AF" stroke="#374151" strokeWidth="1.5"/>
  </svg>
);

const TempleSvg = () => (
  <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Gopuram tiered tower */}
    <polygon points="12,58 20,38 44,38 52,58" fill="#F59E0B" stroke="#78350F" strokeWidth="2"/>
    <polygon points="18,38 23,24 41,24 46,38" fill="#FBBF24" stroke="#78350F" strokeWidth="2"/>
    <polygon points="23,24 26,14 38,14 41,24" fill="#FDE68A" stroke="#78350F" strokeWidth="2"/>
    {/* Kalasams / spires */}
    <line x1="28" y1="14" x2="28" y2="8" stroke="#78350F" strokeWidth="2"/>
    <line x1="32" y1="14" x2="32" y2="6" stroke="#78350F" strokeWidth="2"/>
    <line x1="36" y1="14" x2="36" y2="8" stroke="#78350F" strokeWidth="2"/>
    {/* Door */}
    <rect x="27" y="44" width="10" height="14" rx="2" fill="#78350F"/>
  </svg>
);

const VictoriaMemorialSvg = () => (
  <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Classical Colonnade base */}
    <rect x="8" y="36" width="48" height="22" fill="#F8FAFC" stroke="#475569" strokeWidth="2"/>
    <line x1="16" y1="38" x2="16" y2="58" stroke="#94A3B8" strokeWidth="2"/>
    <line x1="24" y1="38" x2="24" y2="58" stroke="#94A3B8" strokeWidth="2"/>
    <line x1="40" y1="38" x2="40" y2="58" stroke="#94A3B8" strokeWidth="2"/>
    <line x1="48" y1="38" x2="48" y2="58" stroke="#94A3B8" strokeWidth="2"/>
    {/* Main marble Dome */}
    <path d="M32 16C24 22 24 34 32 34C40 34 40 22 32 16Z" fill="#E2E8F0" stroke="#475569" strokeWidth="2"/>
    {/* Angel of Victory */}
    <circle cx="32" cy="12" r="2.5" fill="#F59E0B" stroke="#78350F" strokeWidth="1"/>
    {/* Side Corner Domes */}
    <path d="M14 26C11 29 11 34 14 34C17 34 17 29 14 26Z" fill="#F1F5F9" stroke="#475569" strokeWidth="1.5"/>
    <path d="M50 26C47 29 47 34 50 34C53 34 53 29 50 26Z" fill="#F1F5F9" stroke="#475569" strokeWidth="1.5"/>
  </svg>
);

const MAJOR_CITIES: MajorCity[] = [
  { id: 'Mumbai',    name: 'Mumbai',    svg: <GatewaySvg /> },
  { id: 'New Delhi', name: 'New Delhi', svg: <IndiaGateSvg /> },
  { id: 'Bangalore', name: 'Bengaluru', svg: <VidhanaSoudhaSvg /> },
  { id: 'Hyderabad', name: 'Hyderabad', svg: <CharminarSvg /> },
  { id: 'Ahmedabad', name: 'Ahmedabad', svg: <StadiumSvg /> },
  { id: 'Pune',      name: 'Pune',      svg: <ShaniwarWadaSvg /> },
  { id: 'Chennai',   name: 'Chennai',   svg: <TempleSvg /> },
  { id: 'Kolkata',   name: 'Kolkata',   svg: <VictoriaMemorialSvg /> },
];

const OTHER_POPULAR_CITIES = [
  'Bhopal', 'Bhubaneswar', 'Chandigarh', 'Coimbatore', 'Dehradun', 
  'Goa', 'Gurugram', 'Guwahati', 'Indore', 'Jaipur', 
  'Kochi', 'Lucknow', 'Mysuru', 'Nagpur', 'Noida', 
  'Raipur', 'Surat', 'Thiruvananthapuram', 'Visakhapatnam'
];

export default function CitySelectorModal() {
  const { selectedCity, setSelectedCity, isCityModalOpen, closeCityModal } = useCity();
  const [filterText, setFilterText] = useState('');
  const [detecting, setDetecting] = useState(false);

  const filteredMajorCities = useMemo(() => {
    if (!filterText.trim()) return MAJOR_CITIES;
    const q = filterText.toLowerCase();
    return MAJOR_CITIES.filter(c => c.name.toLowerCase().includes(q));
  }, [filterText]);

  const filteredOtherCities = useMemo(() => {
    if (!filterText.trim()) return OTHER_POPULAR_CITIES;
    const q = filterText.toLowerCase();
    return OTHER_POPULAR_CITIES.filter(c => c.toLowerCase().includes(q));
  }, [filterText]);

  if (!isCityModalOpen) return null;

  const handleSelect = (cityName: string) => {
    setSelectedCity(cityName);
    closeCityModal();
  };

  const handleDetectLocation = () => {
    setDetecting(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          // In local environment or default, detect Hyderabad
          setDetecting(false);
          handleSelect('Hyderabad');
        },
        () => {
          setDetecting(false);
          handleSelect('Hyderabad');
        },
        { timeout: 3000 }
      );
    } else {
      setDetecting(false);
      handleSelect('Hyderabad');
    }
  };

  const isCurrent = (name: string) => {
    if (selectedCity === '' && name === 'All Cities') return true;
    return selectedCity.toLowerCase() === name.toLowerCase();
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={e => e.target === e.currentTarget && closeCityModal()}
      style={{
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        className="city-modal-box"
        style={{
          width: '100%',
          maxWidth: 680,
          background: '#ffffff',
          borderRadius: 24,
          padding: '28px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              fontSize: 22,
              flexShrink: 0
            }}>
              <HiMapPin />
            </div>
            <div>
              <h2 style={{ 
                fontFamily: 'Outfit, sans-serif', 
                fontSize: 22, 
                fontWeight: 800, 
                color: '#1E1B4B',
                margin: 0,
                lineHeight: 1.2
              }}>
                Select your city
              </h2>
              <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
                Browse events happening near you
              </p>
            </div>
          </div>

          <button
            onClick={closeCityModal}
            aria-label="Close dialog"
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
              cursor: 'pointer',
              fontSize: 18,
              transition: 'all 0.2s'
            }}
          >
            <HiXMark />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ 
            flex: '1 1 240px', 
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <HiMagnifyingGlass style={{ position: 'absolute', left: 14, color: '#94A3B8', fontSize: 18 }} />
            <input
              type="text"
              placeholder="Search for a city..."
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 16px 11px 40px',
                borderRadius: 9999,
                border: '1.5px solid #E2E8F0',
                background: '#F8FAFC',
                color: '#1E293B',
                fontSize: 14,
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={detecting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 18px',
              borderRadius: 9999,
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
              transition: 'background 0.2s'
            }}
          >
            <HiMapPin style={{ fontSize: 16 }} />
            <span>{detecting ? 'Detecting…' : 'Detect location'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelect('')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 18px',
              borderRadius: 9999,
              background: selectedCity === '' ? '#047857' : '#10B981',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
              transition: 'background 0.2s'
            }}
          >
            <HiGlobeAlt style={{ fontSize: 16 }} />
            <span>All Cities</span>
          </button>
        </div>

        {/* 8 Major Cities Grid */}
        {filteredMajorCities.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
            marginBottom: 28
          }}>
            {filteredMajorCities.map(city => {
              const active = isCurrent(city.name) || (city.id === 'Bangalore' && isCurrent('Bengaluru'));
              return (
                <button
                  key={city.id}
                  onClick={() => handleSelect(city.name)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px 8px 12px',
                    borderRadius: 16,
                    border: active ? '2px solid #10B981' : '1.5px solid #E2E8F0',
                    background: active ? '#ECFDF5' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: active ? '0 4px 14px rgba(16, 185, 129, 0.15)' : 'none',
                    position: 'relative'
                  }}
                >
                  <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                    {city.svg}
                  </div>
                  <span style={{
                    fontSize: 13,
                    fontWeight: active ? 700 : 600,
                    color: active ? '#059669' : '#334155',
                    textAlign: 'center'
                  }}>
                    {city.name}
                  </span>
                  {active && (
                    <div style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: '#10B981',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11
                    }}>
                      <HiCheck />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* OTHER POPULAR CITIES */}
        <div>
          <h3 style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: '#64748B',
            textTransform: 'uppercase',
            marginBottom: 12
          }}>
            Other Popular Cities
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {filteredOtherCities.map(cityName => {
              const active = isCurrent(cityName);
              return (
                <button
                  key={cityName}
                  onClick={() => handleSelect(cityName)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 9999,
                    border: active ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                    background: active ? '#ECFDF5' : '#F8FAFC',
                    color: active ? '#059669' : '#475569',
                    fontSize: 12.5,
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cityName}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

