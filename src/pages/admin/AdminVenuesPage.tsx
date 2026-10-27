import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { venueService, type Venue } from '../../services/eventService';
import AdminLayout from '../../layouts/AdminLayout';

const EMPTY: Partial<Venue> = { name: '', address: '', city: '', capacity: 0 };

export default function AdminVenuesPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal]   = useState(false);
  const [editItem, setEditItem]     = useState<Venue | null>(null);
  const [form, setForm]             = useState<Partial<Venue>>(EMPTY);
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['venues'], queryFn: () => venueService.getAll() });
  const venues: Venue[] = data?.data ?? [];

  const openCreate = () => { setEditItem(null); setForm(EMPTY); setErrors({}); setShowModal(true); };
  const openEdit   = (v: Venue) => { setEditItem(v); setForm({ name: v.name, address: v.address, city: v.city, capacity: v.capacity }); setErrors({}); setShowModal(true); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name?.trim())    e.name    = 'Venue name is required';
    if (!form.address?.trim()) e.address = 'Address is required';
    if (!form.city?.trim())    e.city    = 'City is required';
    if (!form.capacity || Number(form.capacity) < 1) e.capacity = 'Capacity must be at least 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveMutation = useMutation({
    mutationFn: () => editItem ? venueService.update(editItem.id, form) : venueService.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['venues'] }); setShowModal(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => venueService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['venues'] }); setDeleteConfirm(null); },
  });

  return (
    <AdminLayout>
      <div style={{ maxWidth: 900 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: '#e2e8f0' }}>Venue Management</h1>
            <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{venues.length} venues registered</p>
          </div>
          <button id="btn-create-venue" className="btn btn-primary" onClick={openCreate}>➕ Add Venue</button>
        </div>

        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
          ) : venues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📍</div>
              <p style={{ color: '#64748b' }}>No venues yet.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Venue', 'City', 'Address', 'Capacity', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 18px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {venues.map((v: Venue) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{v.name}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: '#94a3b8' }}>{v.city}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: '#94a3b8' }}>{v.address}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: '#a78bfa', fontWeight: 600 }}>{v.capacity?.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(v)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(v.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: '#10102a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480 }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 800, color: '#e2e8f0', marginBottom: 24 }}>
              {editItem ? '✏️ Edit Venue' : '➕ Add Venue'}
            </h2>
            <form onSubmit={e => { e.preventDefault(); if (validate()) saveMutation.mutate(); }} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label" htmlFor="venue-name">Venue Name *</label>
                <input id="venue-name" className={`input${errors.name ? ' error' : ''}`} placeholder="e.g. HICC, Hyderabad"
                  value={form.name ?? ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                {errors.name && <p className="error-text">{errors.name}</p>}
              </div>
              <div>
                <label className="label" htmlFor="venue-address">Address *</label>
                <input id="venue-address" className={`input${errors.address ? ' error' : ''}`} placeholder="Street address"
                  value={form.address ?? ''} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                {errors.address && <p className="error-text">{errors.address}</p>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="label" htmlFor="venue-city">City *</label>
                  <input id="venue-city" className={`input${errors.city ? ' error' : ''}`} placeholder="e.g. Hyderabad"
                    value={form.city ?? ''} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                  {errors.city && <p className="error-text">{errors.city}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="venue-capacity">Capacity *</label>
                  <input id="venue-capacity" type="number" min="1" className={`input${errors.capacity ? ' error' : ''}`} placeholder="500"
                    value={form.capacity ?? ''} onChange={e => setForm(p => ({ ...p, capacity: Number(e.target.value) }))} />
                  {errors.capacity && <p className="error-text">{errors.capacity}</p>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button id="btn-save-venue" type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving…' : editItem ? 'Save Changes' : 'Add Venue'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm !== null && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#10102a', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: 32, maxWidth: 360, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🗑️</div>
            <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>Delete Venue?</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Events at this venue may be affected.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-danger" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteConfirm!)}>
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
