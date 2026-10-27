import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 30%, rgba(124,58,237,0.15) 0%, transparent 60%), var(--color-surface-900)',
      padding: 24, textAlign: 'center',
    }}>
      <div>
        <div style={{
          fontFamily: 'Outfit,sans-serif', fontSize: 'clamp(80px,15vw,160px)',
          fontWeight: 900, lineHeight: 1,
          background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 16,
        }}>404</div>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 28, fontWeight: 800, color: '#e2e8f0', marginBottom: 12 }}>
          Page Not Found
        </h1>
        <p style={{ fontSize: 16, color: '#64748b', maxWidth: 360, margin: '0 auto 36px', lineHeight: 1.7 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary btn-lg">🏠 Go Home</Link>
          <Link to="/events" className="btn btn-secondary btn-lg">Browse Events</Link>
        </div>
      </div>
    </div>
  );
}
