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
  HiExclamationCircle,
  HiMagnifyingGlass,
  HiFunnel,
  HiPhoto
} from 'react-icons/hi2';
import { eventService, categoryService, venueService, type Event, type Category, type Venue } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../layouts/AdminLayout';

interface EventForm {
  title: string;
  description: string;
  categoryId: string;
  venueId: string;
  dateTime: string;
  price: string;
  totalSeats: string;
  status: string;
  imageUrl: string;
}

const EMPTY_FORM: EventForm = {
  title: '',
  description: '',
  categoryId: '',
  venueId: '',
  dateTime: '',
  price: '0',
  totalSeats: '100',
  status: 'ACTIVE',
  imageUrl: '',
};

export default function AdminEventsPage() {
  const { isSuperAdmin } = useAuth();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<EventForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('ALL');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => eventService.getMyAdminEvents({ size: 100 }),
    retry: false,
  });
  const { data: cats } = useQuery({ queryKey: ['categories'], queryFn: () => categoryService.getAll(), retry: false });
  const { data: venues } = useQuery({ queryKey: ['venues'], queryFn: () => venueService.getAll(), retry: false });

  const rawEvents  = useMemo(() => data?.data?.content ?? [], [data?.data?.content]);
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

  const selectedVenue = useMemo(() => {
    return venueList.find((v: Venue) => String(v.id) === String(form.venueId));
  }, [venueList, form.venueId]);

  const minDateTime = useMemo(() => {
    const d = new Date(Date.now() + 5 * 60000); // at least 5 minutes in future
    return d.toISOString().slice(0, 16);
  }, []);

  const validateField = (field: keyof EventForm, val: string, curForm = form): string => {
    switch (field) {
      case 'title':
        if (!val.trim()) return 'Event title is required';
        if (val.trim().length < 3) return 'Title must be at least 3 characters';
        if (val.trim().length > 150) return 'Title cannot exceed 150 characters';
        return '';
      case 'description':
        if (!val.trim()) return 'Description is required';
        if (val.trim().length < 10) return 'Description must be at least 10 characters';
        return '';
      case 'categoryId':
        if (!val) return 'Please select an event category';
        return '';
      case 'venueId':
        if (!val) return 'Please select a venue';
        return '';
      case 'dateTime': {
        if (!val) return 'Event date & time is required';
        const parsed = new Date(val).getTime();
        if (isNaN(parsed)) return 'Please enter a valid date & time';
        if (parsed <= Date.now()) return 'Event date & time must be in the future';
        return '';
      }
      case 'price': {
        if (val === '' || val === null || val === undefined) return 'Ticket price is required (enter 0 for free events)';
        const num = Number(val);
        if (isNaN(num)) return 'Enter a valid numeric price';
        if (num < 0) return 'Price cannot be negative';
        if (num > 1000000) return 'Price cannot exceed ₹10,00,000';
        return '';
      }
      case 'totalSeats': {
        if (!val) return 'Total available seats is required';
        const seats = Number(val);
        if (isNaN(seats) || !Number.isInteger(seats)) return 'Seats must be a whole number';
        if (seats < 1) return 'At least 1 seat is required';
        const v = venueList.find((ven: Venue) => String(ven.id) === String(curForm.venueId));
        if (v && seats > v.capacity) {
          return `Seats cannot exceed venue capacity (${v.capacity.toLocaleString()} seats max)`;
        }
        return '';
      }
      case 'imageUrl':
        if (val.trim() && !/^https?:\/\/.+/i.test(val.trim())) {
          return 'Image URL must begin with http:// or https://';
        }
        return '';
      default:
        return '';
    }
  };

  const validateAll = (formData = form): Record<string, string> => {
    const errs: Record<string, string> = {};
    const fieldsToValidate: Array<keyof EventForm> = [
      'title', 'description', 'categoryId', 'venueId', 'dateTime', 'price', 'totalSeats', 'imageUrl'
    ];
    fieldsToValidate.forEach(key => {
      const msg = validateField(key, formData[key], formData);
      if (msg) errs[key] = msg;
    });
    return errs;
  };

  const handleFieldChange = (field: keyof EventForm, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);

    if (touched[field] || submitted) {
      const err = validateField(field, value, updated);
      setErrors(prev => {
        const next = { ...prev };
        if (err) next[field] = err;
        else delete next[field];
        return next;
      });
    }

    // When venue changes, re-evaluate totalSeats capacity check
    if (field === 'venueId' && (touched.totalSeats || submitted)) {
      const seatsErr = validateField('totalSeats', updated.totalSeats, updated);
      setErrors(prev => {
        const next = { ...prev };
        if (seatsErr) next.totalSeats = seatsErr;
        else delete next.totalSeats;
        return next;
      });
    }
  };

  const handleFieldBlur = (field: keyof EventForm) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, form[field], form);
    setErrors(prev => {
      const next = { ...prev };
      if (err) next[field] = err;
      else delete next[field];
      return next;
    });
  };

  const openCreate = () => {
    setEditEvent(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setTouched({});
    setSubmitted(false);
    setShowModal(true);
  };

  const openEdit = (ev: Event) => {
    setEditEvent(ev);
    setForm({
      title: ev.title,
      description: ev.description ?? '',
      categoryId: String(ev.category?.id ?? ''),
      venueId: String(ev.venue?.id ?? ''),
      dateTime: ev.dateTime?.slice(0, 16) ?? '',
      price: String(ev.price),
      totalSeats: String(ev.totalSeats),
      status: ev.status,
      imageUrl: ev.imageUrl ?? '',
    });
    setErrors({});
    setTouched({});
    setSubmitted(false);
    setShowModal(true);
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: { id: Number(form.categoryId) },
        venue:    { id: Number(form.venueId) },
        dateTime: form.dateTime,
        price: Number(form.price),
        totalSeats: Number(form.totalSeats),
        status: form.status,
        imageUrl: form.imageUrl.trim() || undefined,
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
    setSubmitted(true);
    setTouched({
      title: true, description: true, categoryId: true, venueId: true,
      dateTime: true, price: true, totalSeats: true, imageUrl: true
    });
    const allErrors = validateAll(form);
    setErrors(allErrors);

    if (Object.keys(allErrors).length === 0) {
      saveMutation.mutate();
    }
  };

  return (
    <AdminLayout>
      <div className="page-container" style={{ maxWidth: 1100, padding: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 10 }}>
              <HiCalendarDays style={{ color: '#10b981' }} />
              <span>{isSuperAdmin ? 'All Platform Events' : 'My Events Management'}</span>
            </h1>
            <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>
              {isSuperAdmin
                ? `${rawEvents.length} total events across all admins`
                : `${rawEvents.length} event${rawEvents.length === 1 ? '' : 's'} created by your admin account`}
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
              <p style={{ color: '#94a3b8', fontWeight: 500 }}>No events found matching your criteria.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {[
                      'Event Name',
                      'Category',
                      ...(isSuperAdmin ? ['Created By'] : []),
                      'Date & Time',
                      'Price',
                      'Capacity / Seats',
                      'Status',
                      'Actions'
                    ].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedEvents.map((ev: Event) => (
                    <tr key={ev.id}>
                      <td>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>{ev.title}</p>
                        <p style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <HiMapPin style={{ color: '#10B981' }} />
                          <span>{ev.venue?.name}, {ev.venue?.city}</span>
                        </p>
                      </td>
                      <td>
                        <span className="badge badge-purple">{ev.category?.name}</span>
                      </td>
                      {isSuperAdmin && (
                        <td>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>
                            {ev.createdByName || 'System Admin'}
                          </p>
                          {ev.createdByEmail && (
                            <p style={{ fontSize: 11.5, color: '#64748B' }}>{ev.createdByEmail}</p>
                          )}
                        </td>
                      )}
                      <td style={{ fontSize: 13, color: '#475569' }}>
                        {new Date(ev.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ fontSize: 14, fontWeight: 800, color: '#059669' }}>
                        {ev.price === 0 ? 'Free' : `₹${ev.price?.toLocaleString('en-IN')}`}
                      </td>
                      <td style={{ fontSize: 13, color: '#64748B' }}>
                        <span style={{ fontWeight: 700, color: ev.availableSeats > 0 ? '#059669' : '#DC2626' }}>
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
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, padding: '0 8px' }}>
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
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 22, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                {editEvent ? <><HiPencilSquare style={{ color: '#10b981' }} /> Edit Event</> : <><HiPlus style={{ color: '#10b981' }} /> Create Event</>}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20 }}>
                <HiXMark />
              </button>
            </div>

            <form onSubmit={handleSave} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Form-level validation summary */}
              {submitted && Object.keys(errors).length > 0 && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: 10,
                  padding: '12px 16px',
                  fontSize: 13,
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <HiExclamationTriangle style={{ fontSize: 20, flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', fontWeight: 700 }}>Validation Errors Detected</strong>
                    <span>Please correct the {Object.keys(errors).length} highlighted field{Object.keys(errors).length > 1 ? 's' : ''} below to proceed.</span>
                  </div>
                </div>
              )}

              <div>
                <label className="label" htmlFor="ev-title">
                  Event Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="ev-title"
                  className={`input${errors.title ? ' error' : ''}`}
                  placeholder="e.g. Annual Tech Symposium 2026"
                  value={form.title}
                  onChange={e => handleFieldChange('title', e.target.value)}
                  onBlur={() => handleFieldBlur('title')}
                />
                {errors.title && (
                  <p className="error-text">
                    <HiExclamationCircle style={{ fontSize: 14, flexShrink: 0 }} />
                    <span>{errors.title}</span>
                  </p>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="label" htmlFor="ev-desc">
                    Description <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <span style={{ fontSize: 11, color: form.description.length < 10 ? '#f87171' : '#94a3b8' }}>
                    {form.description.length} chars (min 10)
                  </span>
                </div>
                <textarea
                  id="ev-desc"
                  className={`input${errors.description ? ' error' : ''}`}
                  placeholder="Describe the event agenda, keynote speakers, and session highlights…"
                  rows={3}
                  value={form.description}
                  onChange={e => handleFieldChange('description', e.target.value)}
                  onBlur={() => handleFieldBlur('description')}
                  style={{ resize: 'vertical' }}
                />
                {errors.description && (
                  <p className="error-text">
                    <HiExclamationCircle style={{ fontSize: 14, flexShrink: 0 }} />
                    <span>{errors.description}</span>
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div>
                  <label className="label" htmlFor="ev-cat">
                    Category <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    id="ev-cat"
                    className={`input${errors.categoryId ? ' error' : ''}`}
                    value={form.categoryId}
                    onChange={e => handleFieldChange('categoryId', e.target.value)}
                    onBlur={() => handleFieldBlur('categoryId')}
                  >
                    <option value="">Select category</option>
                    {categories.map((c: Category) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="error-text">
                      <HiExclamationCircle style={{ fontSize: 14, flexShrink: 0 }} />
                      <span>{errors.categoryId}</span>
                    </p>
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="label" htmlFor="ev-venue">
                      Venue <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    {selectedVenue && (
                      <span style={{ fontSize: 11, color: '#34d399', fontWeight: 600 }}>
                        Cap: {selectedVenue.capacity.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <select
                    id="ev-venue"
                    className={`input${errors.venueId ? ' error' : ''}`}
                    value={form.venueId}
                    onChange={e => handleFieldChange('venueId', e.target.value)}
                    onBlur={() => handleFieldBlur('venueId')}
                  >
                    <option value="">Select venue</option>
                    {venueList.map((v: Venue) => (
                      <option key={v.id} value={v.id}>{v.name}, {v.city} ({v.capacity.toLocaleString()} cap)</option>
                    ))}
                  </select>
                  {errors.venueId && (
                    <p className="error-text">
                      <HiExclamationCircle style={{ fontSize: 14, flexShrink: 0 }} />
                      <span>{errors.venueId}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="label" htmlFor="ev-datetime">
                  Date & Time <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="ev-datetime"
                  type="datetime-local"
                  min={minDateTime}
                  className={`input${errors.dateTime ? ' error' : ''}`}
                  value={form.dateTime}
                  onChange={e => handleFieldChange('dateTime', e.target.value)}
                  onBlur={() => handleFieldBlur('dateTime')}
                />
                {errors.dateTime && (
                  <p className="error-text">
                    <HiExclamationCircle style={{ fontSize: 14, flexShrink: 0 }} />
                    <span>{errors.dateTime}</span>
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
                <div>
                  <label className="label" htmlFor="ev-price">
                    Price (₹) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="ev-price"
                    type="number"
                    min="0"
                    step="1"
                    className={`input${errors.price ? ' error' : ''}`}
                    placeholder="0"
                    value={form.price}
                    onChange={e => handleFieldChange('price', e.target.value)}
                    onBlur={() => handleFieldBlur('price')}
                  />
                  {errors.price && (
                    <p className="error-text">
                      <HiExclamationCircle style={{ fontSize: 14, flexShrink: 0 }} />
                      <span>{errors.price}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="label" htmlFor="ev-seats">
                    Total Seats <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="ev-seats"
                    type="number"
                    min="1"
                    step="1"
                    className={`input${errors.totalSeats ? ' error' : ''}`}
                    placeholder="100"
                    value={form.totalSeats}
                    onChange={e => handleFieldChange('totalSeats', e.target.value)}
                    onBlur={() => handleFieldBlur('totalSeats')}
                  />
                  {errors.totalSeats && (
                    <p className="error-text">
                      <HiExclamationCircle style={{ fontSize: 14, flexShrink: 0 }} />
                      <span>{errors.totalSeats}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="label" htmlFor="ev-status">Status</label>
                  <select
                    id="ev-status"
                    className="input"
                    value={form.status}
                    onChange={e => handleFieldChange('status', e.target.value)}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              {/* Optional Cover Image URL */}
              <div>
                <label className="label" htmlFor="ev-image">
                  <HiPhoto style={{ color: '#10b981' }} />
                  <span>Cover Image URL (optional)</span>
                </label>
                <input
                  id="ev-image"
                  type="url"
                  className={`input${errors.imageUrl ? ' error' : ''}`}
                  placeholder="https://images.unsplash.com/photo-..."
                  value={form.imageUrl}
                  onChange={e => handleFieldChange('imageUrl', e.target.value)}
                  onBlur={() => handleFieldBlur('imageUrl')}
                />
                {errors.imageUrl && (
                  <p className="error-text">
                    <HiExclamationCircle style={{ fontSize: 14, flexShrink: 0 }} />
                    <span>{errors.imageUrl}</span>
                  </p>
                )}
                {form.imageUrl && !errors.imageUrl && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                      src={form.imageUrl}
                      alt="Event Preview"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      style={{ width: 64, height: 44, borderRadius: 6, objectFit: 'cover', border: '1px solid rgba(16,185,129,0.3)' }}
                    />
                    <span style={{ fontSize: 12, color: '#34d399' }}>Image preview loaded</span>
                  </div>
                )}
              </div>

              {saveMutation.isError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 13,
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <HiExclamationTriangle style={{ fontSize: 18, flexShrink: 0 }} />
                  <span>{(axios.isAxiosError(saveMutation.error) && (saveMutation.error.response?.data as { message?: string })?.message) || 'Failed to save event. Please check inputs and try again.'}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  id="btn-save-event"
                  type="submit"
                  className="btn btn-primary"
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? 'Saving…' : editEvent ? 'Save Changes' : 'Create Event'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
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
            <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>Delete Event?</h3>
            <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>This action cannot be undone.</p>
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
