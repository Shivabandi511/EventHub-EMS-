import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  HiTag, 
  HiPlus, 
  HiPencilSquare, 
  HiTrash, 
  HiXMark 
} from 'react-icons/hi2';
import { categoryService, type Category } from '../../services/eventService';
import AdminLayout from '../../layouts/AdminLayout';

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal]   = useState(false);
  const [editItem, setEditItem]     = useState<Category | null>(null);
  const [form, setForm]             = useState({ name: '', description: '' });
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['categories'], queryFn: () => categoryService.getAll() });
  const categories: Category[] = data?.data ?? [];

  const openCreate = () => { setEditItem(null); setForm({ name: '', description: '' }); setErrors({}); setShowModal(true); };
  const openEdit   = (c: Category) => { setEditItem(c); setForm({ name: c.name, description: c.description ?? '' }); setErrors({}); setShowModal(true); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Category name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveMutation = useMutation({
    mutationFn: () => editItem ? categoryService.update(editItem.id, form) : categoryService.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setShowModal(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setDeleteConfirm(null); },
  });

  return (
    <AdminLayout>
      <div className="page-container" style={{ maxWidth: 840, padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
              <HiTag style={{ color: '#7c3aed' }} />
              <span>Event Categories</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{categories.length} categories available</p>
          </div>
          <button id="btn-create-category" className="btn btn-primary" onClick={openCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <HiPlus />
            <span>Add Category</span>
          </button>
        </div>

        <div className="table-container">
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
          ) : categories.length === 0 ? (
            <div className="state-box">
              <div style={{ fontSize: 48, color: '#94a3b8', marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                <HiTag />
              </div>
              <p style={{ color: '#64748b' }}>No categories created yet.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {['#', 'Category Name', 'Description', 'Status', 'Actions'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, idx) => (
                    <tr key={cat.id}>
                      <td style={{ color: '#64748b', fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{cat.name}</td>
                      <td style={{ fontSize: 13, color: '#475569' }}>{cat.description ?? '—'}</td>
                      <td>
                        <span className={`badge ${cat.status === 'INACTIVE' ? 'badge-red' : 'badge-green'}`}>
                          {cat.status ?? 'Active'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(cat)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <HiPencilSquare style={{ fontSize: 14 }} />
                            <span>Edit</span>
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(cat.id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
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
          <div className="modal-box" style={{ maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                {editItem ? <><HiPencilSquare style={{ color: '#7c3aed' }} /> Edit Category</> : <><HiPlus style={{ color: '#7c3aed' }} /> Add Category</>}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20 }}>
                <HiXMark />
              </button>
            </div>

            <form onSubmit={e => { e.preventDefault(); if (validate()) saveMutation.mutate(); }} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label" htmlFor="cat-name">Category Name *</label>
                <input id="cat-name" className={`input${errors.name ? ' error' : ''}`} placeholder="e.g. Technology"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                {errors.name && <p className="error-text">{errors.name}</p>}
              </div>

              <div>
                <label className="label" htmlFor="cat-desc">Description</label>
                <textarea id="cat-desc" className="input" placeholder="Brief description…" rows={3}
                  value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  style={{ resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button id="btn-save-category" type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving…' : editItem ? 'Save Changes' : 'Create Category'}
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
            <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Delete Category?</h3>
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
