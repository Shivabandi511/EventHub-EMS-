import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { eventService, categoryService, venueService, type Event, type Category, type Venue } from '../../services/eventService';
import AdminLayout from '../../layouts/AdminLayout';

interface EventForm {
  title: string; description: string; categoryId: string; venueId: string;
  dateTime: string; price: string; totalSeats: string; status: string;
}

const EMPTY_FORM: EventForm = {
  title: '', description: '', categoryId: '', venueId: '',
  dateTime: '', price: '', totalSeats: '', status: 'ACTIVE',
};

export default function AdminEventsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<EventForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-events', page],
    queryFn: () => eventService.getEvents({ page, size: 10 }),
    retry: false,
  });
  const { data: cats } = useQuery({ queryKey: ['categories'], queryFn: () => categoryService.getAll(), retry: false });
  const { data: venues } = useQuery({ queryKey: ['venues'], queryFn: () => venueService.getAll(), retry: false });

  const events     = data?.data?.content    ?? [];
  const totalPages = data?.data?.totalPages ?? 0;
  const categories = cats?.data    ?? [];
  const venueList  = venues?.data  ?? [];

  const openCreate = () => { setEditEvent(null); setForm(EMPTY_FORM); setErrors({}); setShowModal(true); };
  const openEdit   = (ev: Event) => {
    setEditEvent(ev);
    setForm({
      title: ev.title, description: ev.description ?? '',
      categoryId: String(ev.category?.id ?? ''), venueId: String(ev.venue?.id ?? ''),
      dateTime: ev.dateTime?.slice(0, 16) ?? '', price: String(ev.price),
      totalSeats: String(ev.totalSeats), status: ev.status,
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim())        e.title       = 'Title is required';
    if (!form.categoryId)          e.categoryId  = 'Category is required';
    if (!form.venueId)             e.venueId     = 'Venue is required';
    if (!form.dateTime)            e.dateTime    = 'Date & time is required';
    if (Number(form.price) < 0)    e.price       = 'Price cannot be negative';
    if (Number(form.totalSeats) < 1) e.totalSeats = 'At least 1 seat required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        title: form.title, description: form.description,
        category: { id: Number(form.categoryId) },
        venue:    { id: Number(form.venueId) },
        dateTime: form.dateTime, price: Number(form.price),
        totalSeats: Number(form.totalSeats), status: form.status,
      };
      return editEvent
        ? eventService.updateEvent(editEvent.id, payload)
        : eventService.createEvent(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-events'] });
      qc.invalidateQueries({ queryKey: ['events'] });
      setShowModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => eventService.deleteEvent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-events'] });
      setDeleteConfirm(null);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) saveMutation.mutate();
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: 1100 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: '#0f172a' }}>Event Management</h1>
            <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{data?.data?.totalElements ?? 0} total events</p>
          </div>
          <button id="btn-create-event" className="btn btn-primary" onClick={openCreate}>➕ Create Event</button>
        </div>

        {/* Table */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎭</div>
              <p style={{ color: '#64748b' }}>No events yet. Create your first event!</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  {['Event', 'Category', 'Date', 'Price', 'Seats', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 18px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((ev: Event) => (
                  <tr key={ev.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '14px 18px' }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{ev.title}</p>
                      <p style={{ fontSize: 12, color: '#64748b' }}>📍 {ev.venue?.city}</p>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: '#475569' }}>{ev.category?.name}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: '#475569' }}>{new Date(ev.dateTime).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 700, color: '#2563eb' }}>{ev.price === 0 ? 'Free' : `₹${ev.price}`}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: '#475569' }}>{ev.availableSeats}/{ev.totalSeats}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className={`badge ${ev.status === 'ACTIVE' ? 'badge-green' : ev.status === 'CANCELLED' ? 'badge-red' : 'badge-yellow'}`}>{ev.status}</span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(ev)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(ev.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
            <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ fontSize: 13, color: '#64748b', padding: '0 12px', lineHeight: '32px' }}>Page {page + 1} of {totalPages}</span>
            <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {/* ── Create/Edit Modal ── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: 20, padding: 32, width: '100%', maxWidth: 600,
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.2)',
          }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>
              {editEvent ? '✏️ Edit Event' : '➕ Create Event'}
            </h2>

            <form onSubmit={handleSave} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label" htmlFor="ev-title">Event Title *</label>
                <input id="ev-title" className={`input${errors.title ? ' error' : ''}`} placeholder="e.g. Tech Summit 2026"
                  value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                {errors.title && <p className="error-text">{errors.title}</p>}
              </div>

              <div>
                <label className="label" htmlFor="ev-desc">Description</label>
                <textarea id="ev-desc" className="input" placeholder="Describe the event…" rows={3}
                  value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  style={{ resize: 'vertical' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="label" htmlFor="ev-cat">Category *</label>
                  <select id="ev-cat" className={`input${errors.categoryId ? ' error' : ''}`}
                    value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}>
                    <option value="">Select category</option>
                    {categories.map((c: Category) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.categoryId && <p className="error-text">{errors.categoryId}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="ev-venue">Venue *</label>
                  <select id="ev-venue" className={`input${errors.venueId ? ' error' : ''}`}
                    value={form.venueId} onChange={e => setForm(p => ({ ...p, venueId: e.target.value }))}>
                    <option value="">Select venue</option>
                    {venueList.map((v: Venue) => <option key={v.id} value={v.id}>{v.name}, {v.city}</option>)}
                  </select>
                  {errors.venueId && <p className="error-text">{errors.venueId}</p>}
                </div>
              </div>

              <div>
                <label className="label" htmlFor="ev-datetime">Date & Time *</label>
                <input id="ev-datetime" type="datetime-local" className={`input${errors.dateTime ? ' error' : ''}`}
                  value={form.dateTime} onChange={e => setForm(p => ({ ...p, dateTime: e.target.value }))} />
                {errors.dateTime && <p className="error-text">{errors.dateTime}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label className="label" htmlFor="ev-price">Price (₹) *</label>
                  <input id="ev-price" type="number" min="0" className={`input${errors.price ? ' error' : ''}`}
                    placeholder="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
                  {errors.price && <p className="error-text">{errors.price}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="ev-seats">Total Seats *</label>
                  <input id="ev-seats" type="number" min="1" className={`input${errors.totalSeats ? ' error' : ''}`}
                    placeholder="100" value={form.totalSeats} onChange={e => setForm(p => ({ ...p, totalSeats: e.target.value }))} />
                  {errors.totalSeats && <p className="error-text">{errors.totalSeats}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="ev-status">Status</label>
                  <select id="ev-status" className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="ACTIVE">Active</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              {saveMutation.isError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171' }}>
                  ⚠️ {(axios.isAxiosError(saveMutation.error) && (saveMutation.error.response?.data as { message?: string })?.message) || 'Failed to save. Try again.'}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button id="btn-save-event" type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving…' : editEvent ? 'Save Changes' : 'Create Event'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirm !== null && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 110,
          background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{ background: '#ffffff', border: '1px solid #fecaca', borderRadius: 16, padding: 32, maxWidth: 380, width: '100%', textAlign: 'center', boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.2)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗑️</div>
            <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Delete Event?</h3>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-danger" disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteConfirm!)}>
                {deleteMutation.isPending ? 'Deleting…' : 'Yes, Delete'}
              </button>
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
