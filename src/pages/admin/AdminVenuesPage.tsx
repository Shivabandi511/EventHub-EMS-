import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  HiMapPin, 
  HiPlus, 
  HiPencilSquare, 
  HiTrash, 
  HiXMark,
  HiExclamationTriangle,
  HiExclamationCircle
} from 'react-icons/hi2';
import { venueService, type Venue } from '../../services/eventService';
import AdminLayout from '../../layouts/AdminLayout';

interface VenueForm {
  name: string;
  address: string;
  city: string;
  capacity: string;
}

const EMPTY: VenueForm = { name: '', address: '', city: '', capacity: '500' };

export default function AdminVenuesPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal]   = useState(false);
  const [editItem, setEditItem]     = useState<Venue | null>(null);
  const [form, setForm]             = useState<VenueForm>(EMPTY);
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [touched, setTouched]       = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted]   = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['venues'], queryFn: () => venueService.getAll() });
  const venues: Venue[] = data?.data ?? [];

  const validateField = (field: keyof VenueForm, val: string): string => {
    switch (field) {
      case 'name':
        if (!val.trim()) return 'Venue name is required';
        if (val.trim().length < 3) return 'Venue name must be at least 3 characters';
        if (val.trim().length > 100) return 'Venue name cannot exceed 100 characters';
        return '';
      case 'city':
        if (!val.trim()) return 'City is required';
        if (val.trim().length < 2) return 'City must be at least 2 characters';
        return '';
      case 'address':
        if (!val.trim()) return 'Address is required';
        if (val.trim().length < 5) return 'Address must be at least 5 characters';
        return '';
      case 'capacity': {
        if (!val) return 'Seating capacity is required';
        const num = Number(val);
        if (isNaN(num) || !Number.isInteger(num)) return 'Capacity must be a whole number';
        if (num < 1) return 'Capacity must be at least 1 seat';
        if (num > 500000) return 'Capacity cannot exceed 5,00,000 seats';
        return '';
      }
      default:
        return '';
    }
  };

  const validateAll = (data = form): Record<string, string> => {
    const errs: Record<string, string> = {};
    (Object.keys(data) as Array<keyof VenueForm>).forEach(key => {
      const msg = validateField(key, data[key]);
      if (msg) errs[key] = msg;
    });
    return errs;
  };

  const handleChange = (field: keyof VenueForm, value: string) => {
    const nextForm = { ...form, [field]: value };
    setForm(nextForm);
    if (touched[field] || submitted) {
      const msg = validateField(field, value);
      setErrors(prev => {
        const next = { ...prev };
        if (msg) next[field] = msg;
        else delete next[field];
        return next;
      });
    }
  };

  const handleBlur = (field: keyof VenueForm) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const msg = validateField(field, form[field]);
    setErrors(prev => {
      const next = { ...prev };
      if (msg) next[field] = msg;
      else delete next[field];
      return next;
    });
  };

  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY);
    setErrors({});
    setTouched({});
    setSubmitted(false);
    setShowModal(true);
  };

  const openEdit = (v: Venue) => {
    setEditItem(v);
    setForm({
      name: v.name,
      address: v.address,
      city: v.city,
      capacity: String(v.capacity)
    });
    setErrors({});
    setTouched({});
    setSubmitted(false);
    setShowModal(true);
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        capacity: Number(form.capacity),
      };
      return editItem ? venueService.update(editItem.id, payload) : venueService.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['venues'] });
      setShowModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => venueService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['venues'] });
      setDeleteConfirm(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTouched({ name: true, city: true, address: true, capacity: true });
    const allErrors = validateAll(form);
    setErrors(allErrors);
    if (Object.keys(allErrors).length === 0) {
      saveMutation.mutate();
    }
  };

  return (
    <AdminLayout>
      <div className="page-container" style={{ maxWidth: 960, padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 10 }}>
              <HiMapPin style={{ color: '#10b981' }} />
              <span>Venue Management</span>
            </h1>
            <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>{venues.length} venues registered</p>
          </div>
          <button id="btn-create-venue" className="btn btn-primary" onClick={openCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <HiPlus />
            <span>Add Venue</span>
          </button>
        </div>

        <div className="table-container">
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
          ) : venues.length === 0 ? (
            <div className="state-box">
              <div style={{ fontSize: 48, color: '#94a3b8', marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                <HiMapPin />
              </div>
              <p style={{ color: '#94a3b8' }}>No venues registered yet.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {['Venue Name', 'City', 'Address', 'Capacity', 'Actions'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {venues.map((v: Venue) => (
                    <tr key={v.id}>
                      <td style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{v.name}</td>
                      <td style={{ fontSize: 13, color: '#059669', fontWeight: 600 }}>{v.city}</td>
                      <td style={{ fontSize: 13, color: '#64748B' }}>{v.address}</td>
                      <td style={{ fontSize: 13, color: '#059669', fontWeight: 700 }}>{v.capacity?.toLocaleString('en-IN')} seats</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(v)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <HiPencilSquare style={{ fontSize: 14 }} />
                            <span>Edit</span>
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(v.id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                {editItem ? <><HiPencilSquare style={{ color: '#10b981' }} /> Edit Venue</> : <><HiPlus style={{ color: '#10b981' }} /> Add Venue</>}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20 }}>
                <HiXMark />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {submitted && Object.keys(errors).length > 0 && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  fontSize: 13,
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <HiExclamationTriangle style={{ fontSize: 18, flexShrink: 0 }} />
                  <span>Please correct the {Object.keys(errors).length} highlighted field{Object.keys(errors).length > 1 ? 's' : ''} below.</span>
                </div>
              )}

              <div>
                <label className="label" htmlFor="vn-name">
                  Venue Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="vn-name"
                  className={`input${errors.name ? ' error' : ''}`}
                  placeholder="e.g. HITEX Exhibition Center"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                />
                {errors.name && (
                  <p className="error-text">
                    <HiExclamationCircle style={{ fontSize: 14, flexShrink: 0 }} />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="vn-city">
                  City <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="vn-city"
                  className={`input${errors.city ? ' error' : ''}`}
                  placeholder="e.g. Hyderabad"
                  value={form.city}
                  onChange={e => handleChange('city', e.target.value)}
                  onBlur={() => handleBlur('city')}
                />
                {errors.city && (
                  <p className="error-text">
                    <HiExclamationCircle style={{ fontSize: 14, flexShrink: 0 }} />
                    <span>{errors.city}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="vn-addr">
                  Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="vn-addr"
                  className={`input${errors.address ? ' error' : ''}`}
                  placeholder="Street / Area / Landmark"
                  value={form.address}
                  onChange={e => handleChange('address', e.target.value)}
                  onBlur={() => handleBlur('address')}
                />
                {errors.address && (
                  <p className="error-text">
                    <HiExclamationCircle style={{ fontSize: 14, flexShrink: 0 }} />
                    <span>{errors.address}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="vn-cap">
                  Capacity <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="vn-cap"
                  type="number"
                  min="1"
                  step="1"
                  className={`input${errors.capacity ? ' error' : ''}`}
                  placeholder="e.g. 5000"
                  value={form.capacity}
                  onChange={e => handleChange('capacity', e.target.value)}
                  onBlur={() => handleBlur('capacity')}
                />
                {errors.capacity && (
                  <p className="error-text">
                    <HiExclamationCircle style={{ fontSize: 14, flexShrink: 0 }} />
                    <span>{errors.capacity}</span>
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button id="btn-save-venue" type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving…' : editItem ? 'Save Changes' : 'Create Venue'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm !== null && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 360, textAlign: 'center' }}>
            <div style={{ fontSize: 44, color: '#e11d48', marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
              <HiTrash />
            </div>
            <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>Delete Venue?</h3>
            <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-danger" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteConfirm!)}>
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
