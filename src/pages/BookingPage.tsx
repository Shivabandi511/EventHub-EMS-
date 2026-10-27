import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { eventService } from '../services/eventService';
import { bookingService } from '../services/bookingService';
import CustomerLayout from '../layouts/CustomerLayout';

interface AttendeeForm { name: string; email: string; phone: string; }

export default function BookingPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [ticketCount, setTicketCount] = useState(1);
  const [attendees, setAttendees] = useState<AttendeeForm[]>([{ name: '', email: '', phone: '' }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventService.getEvent(Number(eventId)),
    enabled: !!eventId,
  });

  const event = data?.data;

  const mutation = useMutation({
    mutationFn: () => bookingService.create({
      eventId: Number(eventId),
      ticketCount,
      attendees,
    }),
    onSuccess: (res) => navigate(`/booking/confirmation/${res.data.id}`),
  });

  const updateTicketCount = (count: number) => {
    setTicketCount(count);
    if (count > attendees.length) {
      setAttendees(a => [...a, ...Array(count - a.length).fill({ name: '', email: '', phone: '' })]);
    } else {
      setAttendees(a => a.slice(0, count));
    }
  };

  const updateAttendee = (idx: number, field: keyof AttendeeForm, value: string) => {
    setAttendees(a => a.map((at, i) => i === idx ? { ...at, [field]: value } : at));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (ticketCount < 1) e.tickets = 'At least 1 ticket required';
    if (event && ticketCount > event.availableSeats) e.tickets = `Only ${event.availableSeats} seats available`;
    attendees.forEach((at, i) => {
      if (!at.name.trim())                          e[`name_${i}`]  = 'Name required';
      if (!at.email || !/\S+@\S+\.\S+/.test(at.email)) e[`email_${i}`] = 'Valid email required';
      if (!at.phone || !/^\d{10}$/.test(at.phone))  e[`phone_${i}`] = '10-digit phone required';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) mutation.mutate();
  };

  if (isLoading) return (
    <CustomerLayout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <div className="spinner" style={{ width: 44, height: 44 }} />
      </div>
    </CustomerLayout>
  );

  if (!event) return (
    <CustomerLayout>
      <div style={{ textAlign: 'center', padding: 80 }}>
        <p style={{ color: '#64748b' }}>Event not found.</p>
        <Link to="/events" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Events</Link>
      </div>
    </CustomerLayout>
  );

  const totalAmount = ticketCount * event.price;

  return (
    <CustomerLayout>
      <div className="container-app" style={{ padding: '40px 24px' }}>
        {/* Breadcrumb */}
        <nav style={{ marginBottom: 28, fontSize: 13, color: '#64748b' }}>
          <Link to="/events" style={{ color: '#64748b', textDecoration: 'none' }}>Events</Link>
          {' / '}
          <Link to={`/events/${eventId}`} style={{ color: '#64748b', textDecoration: 'none' }}>{event.title}</Link>
          {' / '}
          <span style={{ color: '#a78bfa' }}>Book Tickets</span>
        </nav>

        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 30, fontWeight: 800, color: '#e2e8f0', marginBottom: 32 }}>
          🎟️ Book Tickets
        </h1>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Ticket Count */}
              <div className="glass-card" style={{ padding: 24 }}>
                <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>
                  Number of Tickets
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <button type="button" className="btn btn-secondary" style={{ width: 40, height: 40, borderRadius: '50%', padding: 0, fontSize: 20 }}
                    onClick={() => updateTicketCount(Math.max(1, ticketCount - 1))}>−</button>
                  <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 28, fontWeight: 800, color: '#a78bfa', minWidth: 40, textAlign: 'center' }}>
                    {ticketCount}
                  </span>
                  <button type="button" className="btn btn-secondary" style={{ width: 40, height: 40, borderRadius: '50%', padding: 0, fontSize: 20 }}
                    onClick={() => updateTicketCount(Math.min(event.availableSeats, ticketCount + 1))}>+</button>
                  <span style={{ fontSize: 13, color: '#64748b' }}>(max {event.availableSeats})</span>
                </div>
                {errors.tickets && <p className="error-text" style={{ marginTop: 8 }}>{errors.tickets}</p>}
              </div>

              {/* Attendee Details */}
              <div className="glass-card" style={{ padding: 24 }}>
                <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 20 }}>
                  Attendee Details
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {attendees.map((at, i) => (
                    <div key={i}>
                      {ticketCount > 1 && (
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa', marginBottom: 12 }}>
                          Attendee {i + 1}
                        </p>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                          <label className="label" htmlFor={`att-name-${i}`}>Full Name</label>
                          <input id={`att-name-${i}`} className={`input${errors[`name_${i}`] ? ' error' : ''}`}
                            placeholder="John Doe" value={at.name}
                            onChange={e => updateAttendee(i, 'name', e.target.value)} />
                          {errors[`name_${i}`] && <p className="error-text">{errors[`name_${i}`]}</p>}
                        </div>
                        <div>
                          <label className="label" htmlFor={`att-email-${i}`}>Email</label>
                          <input id={`att-email-${i}`} type="email" className={`input${errors[`email_${i}`] ? ' error' : ''}`}
                            placeholder="john@example.com" value={at.email}
                            onChange={e => updateAttendee(i, 'email', e.target.value)} />
                          {errors[`email_${i}`] && <p className="error-text">{errors[`email_${i}`]}</p>}
                        </div>
                        <div>
                          <label className="label" htmlFor={`att-phone-${i}`}>Phone</label>
                          <input id={`att-phone-${i}`} type="tel" className={`input${errors[`phone_${i}`] ? ' error' : ''}`}
                            placeholder="9876543210" value={at.phone}
                            onChange={e => updateAttendee(i, 'phone', e.target.value)} />
                          {errors[`phone_${i}`] && <p className="error-text">{errors[`phone_${i}`]}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Summary */}
            <div style={{ position: 'sticky', top: 90 }}>
              <div className="glass-card glow-sm" style={{ padding: 24 }}>
                <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 20 }}>
                  Order Summary
                </h2>
                <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>{event.title}</p>
                  <p style={{ fontSize: 13, color: '#64748b' }}>📅 {new Date(event.dateTime).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                  <p style={{ fontSize: 13, color: '#64748b' }}>📍 {event.venue?.name}, {event.venue?.city}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: '#94a3b8' }}>Price × {ticketCount}</span>
                    <span style={{ color: '#e2e8f0' }}>₹{event.price} × {ticketCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <span style={{ color: '#e2e8f0', fontWeight: 700 }}>Total</span>
                    <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 22, fontWeight: 800, color: '#a78bfa' }}>
                      {totalAmount === 0 ? 'Free' : `₹${totalAmount.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>

                {mutation.isError && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#f87171' }}>
                    ⚠️ {(mutation.error as any)?.response?.data?.message ?? 'Booking failed. Please try again.'}
                  </div>
                )}

                <button id="btn-confirm-booking" type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={mutation.isPending}>
                  {mutation.isPending
                    ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Booking…</>
                    : '✅ Confirm Booking'}
                </button>
                <p style={{ textAlign: 'center', fontSize: 12, color: '#475569', marginTop: 12 }}>
                  🔒 Simulated payment — no real charge
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </CustomerLayout>
  );
}
