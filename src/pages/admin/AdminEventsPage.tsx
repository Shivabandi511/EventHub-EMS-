import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  HiCalendarDays, 
  HiPlus, 
  HiPencilSquare, 
  HiTrash, 
  HiChevronLeft, 
  HiChevronRight, 
  HiMapPin, 
  HiTicket, 
  HiXMark,
  HiExclamationTriangle,
  HiMagnifyingGlass,
  HiFunnel
} from 'react-icons/hi2';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('ALL');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => eventService.getEvents({ size: 100 }),
    retry: false,
  });
  const { data: cats } = useQuery({ queryKey: ['categories'], queryFn: () => categoryService.getAll(), retry: false });
  const { data: venues } = useQuery({ queryKey: ['venues'], queryFn: () => venueService.getAll(), retry: false });

  const rawEvents  = data?.data?.content ?? [];
  const categories = cats?.data          ?? [];
  const venueList  = venues?.data        ?? [];

  const filteredEvents = useMemo(() => {
    return rawEvents.filter((ev: Event) => {
      const matchesCat = selectedCatId === 'ALL' || String(ev.category?.id) === selectedCatId;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        ev.title.toLowerCase().includes(q) ||
        (ev.venue?.city ?? '').toLowerCase().includes(q) ||
        (ev.venue?.name ?? '').toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [rawEvents, selectedCatId, searchQuery]);

  const pageSize = 8;
  const totalPages = Math.ceil(filteredEvents.length / pageSize) || 1;
  const pagedEvents = filteredEvents.slice(page * pageSize, (page + 1) * pageSize);

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
    if (!form.title.trim())          e.title       = 'Title is required';
    if (!form.categoryId)            e.categoryId  = 'Category is required';
    if (!form.venueId)               e.venueId     = 'Venue is required';
    if (!form.dateTime)              e.dateTime    = 'Date & time is required';
    if (Number(form.price) < 0)      e.price       = 'Price cannot be negative';
    if (Number(form.totalSeats) < 1) e.totalSeats  = 'At least 1 seat required';
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
      qc.invalidateQueries({ queryKey: ['events'] });
      setDeleteConfirm(null);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) saveMutation.mutate();
  };

  return (
    <AdminLayout>
      <div className="page-container" style={{ maxWidth: 1100, padding: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
              <HiCalendarDays style={{ color: '#7c3aed' }} />
              <span>Event Management</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
              {rawEvents.length} total events organized in platform
            </p>
          </div>
          <button id="btn-create-event" className="btn btn-primary" onClick={openCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <HiPlus />
            <span>Create Event</span>
          </button>
        </div>

        {/* Filter Card */}
        <div className="filter-card" style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
              <HiMagnifyingGlass style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 18 }} />
              <input
                type="text"
                className="input"
                style={{ paddingLeft: 42 }}
                placeholder="Search event title, venue or city..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setPage(0); }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
              <HiFunnel style={{ fontSize: 14 }} /> Category:
            </span>
            <button
              className={`filter-chip ${selectedCatId === 'ALL' ? 'active' : ''}`}
              onClick={() => { setSelectedCatId('ALL'); setPage(0); }}
            >
              All Categories
            </button>
            {categories.map((c: Category) => (
              <button
                key={c.id}
                className={`filter-chip ${selectedCatId === String(c.id) ? 'active' : ''}`}
                onClick={() => { setSelectedCatId(String(c.id)); setPage(0); }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="state-box">
              <div style={{ fontSize: 48, color: '#94a3b8', marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                <HiTicket />
              </div>
              <p style={{ color: '#64748b', fontWeight: 500 }}>No events found matching your criteria.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {['Event Name', 'Category', 'Date & Time', 'Price', 'Capacity / Seats', 'Status', 'Actions'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedEvents.map((ev: Event) => (
                    <tr key={ev.id}>
                      <td>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{ev.title}</p>
                        <p style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <HiMapPin style={{ color: '#e11d48' }} />
                          <span>{ev.venue?.name}, {ev.venue?.city}</span>
                        </p>
                      </td>
                      <td>
                        <span className="badge badge-purple">{ev.category?.name}</span>
                      </td>
                      <td style={{ fontSize: 13, color: '#475569' }}>
                        {new Date(ev.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ fontSize: 14, fontWeight: 800, color: '#059669' }}>
                        {ev.price === 0 ? 'Free' : `₹${ev.price?.toLocaleString('en-IN')}`}
                      </td>
                      <td style={{ fontSize: 13, color: '#475569' }}>
                        <span style={{ fontWeight: 700, color: ev.availableSeats > 0 ? '#059669' : '#e11d48' }}>
                          {ev.availableSeats}
                        </span> / {ev.totalSeats} seats
                      </td>
                      <td>
                        <span className={`badge ${ev.status === 'ACTIVE' ? 'badge-green' : ev.status === 'CANCELLED' ? 'badge-red' : 'badge-yellow'}`}>
                          {ev.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(ev)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <HiPencilSquare style={{ fontSize: 14 }} />
                            <span>Edit</span>
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(ev.id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiTrash style={{ fontSize: 14 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <button
              className="pagination-btn"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
            >
              <HiChevronLeft /> Prev
            </button>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600, padding: '0 8px' }}>
              Page {page + 1} of {totalPages}
            </span>
            <button
              className="pagination-btn"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
            >
              Next <HiChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* ── Create/Edit Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 620 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 22, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                {editEvent ? <><HiPencilSquare style={{ color: '#7c3aed' }} /> Edit Event</> : <><HiPlus style={{ color: '#7c3aed' }} /> Create Event</>}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20 }}>
                <HiXMark />
              </button>
            </div>

            <form onSubmit={handleSave} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label" htmlFor="ev-title">Event Title *</label>
                <input id="ev-title" className={`input${errors.title ? ' error' : ''}`} placeholder="e.g. Annual Tech Symposium"
                  value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                {errors.title && <p className="error-text">{errors.title}</p>}
              </div>

              <div>
                <label className="label" htmlFor="ev-desc">Description</label>
                <textarea id="ev-desc" className="input" placeholder="Describe the event, agenda, and speakers…" rows={3}
                  value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  style={{ resize: 'vertical' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
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
                <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#e11d48', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HiExclamationTriangle style={{ fontSize: 18, flexShrink: 0 }} />
                  <span>{(axios.isAxiosError(saveMutation.error) && (saveMutation.error.response?.data as { message?: string })?.message) || 'Failed to save. Try again.'}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
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
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 380, textAlign: 'center' }}>
            <div style={{ fontSize: 44, color: '#e11d48', marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
              <HiTrash />
            </div>
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
