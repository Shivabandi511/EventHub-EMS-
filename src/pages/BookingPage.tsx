import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  HiTicket, 
  HiCalendar, 
  HiMapPin, 
  HiPlus, 
  HiMinus, 
  HiLockClosed, 
  HiCheck, 
  HiExclamationTriangle,
  HiUser,
  HiEnvelope,
  HiPhone
} from 'react-icons/hi2';
import { eventService } from '../services/eventService';
import { bookingService } from '../services/bookingService';
import CustomerLayout from '../layouts/CustomerLayout';

interface AttendeeForm { name: string; email: string; phone: string; }

export default function BookingPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      navigate(`/booking/confirmation/${res.data.id}`);
    },
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
      <div className="state-box" style={{ maxWidth: 500, margin: '80px auto' }}>
        <p style={{ color: '#6b7280', marginBottom: 16 }}>Event not found.</p>
        <Link to="/events" className="btn btn-primary">Browse Events</Link>
      </div>
    </CustomerLayout>
  );

  const totalAmount = ticketCount * event.price;

  return (
    <CustomerLayout>
      <div className="container-app page-container">
        {/* Breadcrumb */}
        <nav style={{ marginBottom: 28, fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link to="/events" style={{ color: '#6b7280', textDecoration: 'none' }}>Events</Link>
          <span>/</span>
          <Link to={`/events/${eventId}`} style={{ color: '#6b7280', textDecoration: 'none' }}>{event.title}</Link>
          <span>/</span>
          <span style={{ color: '#7c3aed', fontWeight: 600 }}>Book Tickets</span>
        </nav>

        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#1e1b4b', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="booking-icon-box">
            <HiTicket />
          </div>
          <span>Book Tickets</span>
        </h1>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 28, alignItems: 'start' }}>
            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Ticket Count */}
              <div className="glass-card" style={{ padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e1b4b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HiTicket style={{ color: '#7c3aed' }} />
                  <span>Number of Tickets</span>
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <button type="button" className="btn btn-secondary" style={{ width: 42, height: 42, borderRadius: '50%', padding: 0 }}
                    onClick={() => updateTicketCount(Math.max(1, ticketCount - 1))}>
                    <HiMinus />
                  </button>
                  <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 30, fontWeight: 900, color: '#7c3aed', minWidth: 44, textAlign: 'center' }}>
                    {ticketCount}
                  </span>
                  <button type="button" className="btn btn-secondary" style={{ width: 42, height: 42, borderRadius: '50%', padding: 0 }}
                    onClick={() => updateTicketCount(Math.min(event.availableSeats, ticketCount + 1))}>
                    <HiPlus />
                  </button>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>(max {event.availableSeats} available)</span>
                </div>
                {errors.tickets && <p className="error-text" style={{ marginTop: 8 }}>{errors.tickets}</p>}
              </div>

              {/* Attendee Details */}
              <div className="glass-card" style={{ padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e1b4b', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HiUser style={{ color: '#7c3aed' }} />
                  <span>Attendee Details</span>
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {attendees.map((at, i) => (
                    <div key={i} style={{ paddingBottom: attendees.length > 1 && i < attendees.length - 1 ? 20 : 0, borderBottom: attendees.length > 1 && i < attendees.length - 1 ? '1px dashed #ede9fe' : 'none' }}>
                      {ticketCount > 1 && (
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <HiUser style={{ fontSize: 14 }} />
                          Attendee {i + 1}
                        </p>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                          <label className="label" htmlFor={`att-name-${i}`}>
                            <HiUser style={{ fontSize: 14, color: '#6b7280' }} />
                            <span>Full Name</span>
                          </label>
                          <input id={`att-name-${i}`} className={`input${errors[`name_${i}`] ? ' error' : ''}`}
                            placeholder="John Doe" value={at.name}
                            onChange={e => updateAttendee(i, 'name', e.target.value)} />
                          {errors[`name_${i}`] && <p className="error-text">{errors[`name_${i}`]}</p>}
                        </div>
                        <div>
                          <label className="label" htmlFor={`att-email-${i}`}>
                            <HiEnvelope style={{ fontSize: 14, color: '#6b7280' }} />
                            <span>Email</span>
                          </label>
                          <input id={`att-email-${i}`} type="email" className={`input${errors[`email_${i}`] ? ' error' : ''}`}
                            placeholder="john@example.com" value={at.email}
                            onChange={e => updateAttendee(i, 'email', e.target.value)} />
                          {errors[`email_${i}`] && <p className="error-text">{errors[`email_${i}`]}</p>}
                        </div>
                        <div>
                          <label className="label" htmlFor={`att-phone-${i}`}>
                            <HiPhone style={{ fontSize: 14, color: '#6b7280' }} />
                            <span>Phone</span>
                          </label>
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
              <div className="glass-card" style={{ padding: 26, boxShadow: '0 8px 30px rgba(124, 58, 237, 0.08)' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e1b4b', marginBottom: 20 }}>
                  Order Summary
                </h2>
                <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #ede9fe' }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#1e1b4b', marginBottom: 6 }}>{event.title}</p>
                  <p style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <HiCalendar style={{ color: '#7c3aed' }} />
                    <span>{new Date(event.dateTime).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                  </p>
                  <p style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <HiMapPin style={{ color: '#e11d48' }} />
                    <span>{event.venue?.name}, {event.venue?.city}</span>
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: '#6b7280' }}>Price × {ticketCount}</span>
                    <span style={{ color: '#1e1b4b', fontWeight: 600 }}>₹{event.price} × {ticketCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, paddingTop: 10, borderTop: '1px solid #ede9fe' }}>
                    <span style={{ color: '#1e1b4b', fontWeight: 700 }}>Total Amount</span>
                    <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 900, color: '#059669' }}>
                      {totalAmount === 0 ? 'Free' : `₹${totalAmount.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>

                {mutation.isError && (
                  <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#be123c', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HiExclamationTriangle style={{ fontSize: 18, flexShrink: 0 }} />
                    <span>{(axios.isAxiosError(mutation.error) && (mutation.error.response?.data as { message?: string })?.message) || 'Booking failed. Please try again.'}</span>
                  </div>
                )}

                <button id="btn-confirm-booking" type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={mutation.isPending}>
                  {mutation.isPending
                    ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Processing…</>
                    : <><HiCheck style={{ fontSize: 20 }} /> Confirm Booking</>}
                </button>
                <p style={{ textAlign: 'center', fontSize: 12, color: '#6b7280', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <HiLockClosed style={{ color: '#059669' }} />
                  <span>Simulated reservation — no card needed</span>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </CustomerLayout>
  );
}
