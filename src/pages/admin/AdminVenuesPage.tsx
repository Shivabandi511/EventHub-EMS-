import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  HiMapPin, 
  HiPlus, 
  HiPencilSquare, 
  HiTrash, 
  HiXMark 
} from 'react-icons/hi2';
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
      <div className="page-container" style={{ maxWidth: 960, padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
              <HiMapPin style={{ color: '#7c3aed' }} />
              <span>Venue Management</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{venues.length} venues registered</p>
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
              <p style={{ color: '#64748b' }}>No venues registered yet.</p>
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
                      <td style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{v.name}</td>
                      <td style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>{v.city}</td>
                      <td style={{ fontSize: 13, color: '#64748b' }}>{v.address}</td>
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
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                {editItem ? <><HiPencilSquare style={{ color: '#7c3aed' }} /> Edit Venue</> : <><HiPlus style={{ color: '#7c3aed' }} /> Add Venue</>}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20 }}>
                <HiXMark />
              </button>
            </div>

            <form onSubmit={e => { e.preventDefault(); if (validate()) saveMutation.mutate(); }} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label" htmlFor="vn-name">Venue Name *</label>
                <input id="vn-name" className={`input${errors.name ? ' error' : ''}`} placeholder="e.g. HITEX Exhibition Center"
                  value={form.name ?? ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                {errors.name && <p className="error-text">{errors.name}</p>}
              </div>

              <div>
                <label className="label" htmlFor="vn-city">City *</label>
                <input id="vn-city" className={`input${errors.city ? ' error' : ''}`} placeholder="e.g. Hyderabad"
                  value={form.city ?? ''} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                {errors.city && <p className="error-text">{errors.city}</p>}
              </div>

              <div>
                <label className="label" htmlFor="vn-addr">Address *</label>
                <input id="vn-addr" className={`input${errors.address ? ' error' : ''}`} placeholder="Street / Area address"
                  value={form.address ?? ''} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                {errors.address && <p className="error-text">{errors.address}</p>}
              </div>

              <div>
                <label className="label" htmlFor="vn-cap">Capacity *</label>
                <input id="vn-cap" type="number" min="1" className={`input${errors.capacity ? ' error' : ''}`} placeholder="e.g. 5000"
                  value={form.capacity ?? ''} onChange={e => setForm(p => ({ ...p, capacity: Number(e.target.value) }))} />
                {errors.capacity && <p className="error-text">{errors.capacity}</p>}
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
            <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Delete Venue?</h3>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>This action cannot be undone.</p>
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
