import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
      <div style={{ maxWidth: 780 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: '#0f172a' }}>Categories</h1>
            <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{categories.length} categories</p>
          </div>
          <button id="btn-create-category" className="btn btn-primary" onClick={openCreate}>➕ Add Category</button>
        </div>

        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
          ) : categories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏷️</div>
              <p style={{ color: '#64748b' }}>No categories yet.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  {['#', 'Name', 'Description', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 18px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => (
                  <tr key={cat.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: '#64748b' }}>{idx + 1}</td>
                    <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{cat.name}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: '#475569' }}>{cat.description ?? '—'}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className={`badge ${cat.status === 'INACTIVE' ? 'badge-red' : 'badge-green'}`}>
                        {cat.status ?? 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(cat)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(cat.id)}>🗑️</button>
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 20, padding: 32, width: '100%', maxWidth: 440, boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.2)' }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>
              {editItem ? '✏️ Edit Category' : '➕ Add Category'}
            </h2>
            <form onSubmit={e => { e.preventDefault(); if (validate()) saveMutation.mutate(); }} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label" htmlFor="cat-name">Name *</label>
                <input id="cat-name" className={`input${errors.name ? ' error' : ''}`} placeholder="e.g. Music"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                {errors.name && <p className="error-text">{errors.name}</p>}
              </div>
              <div>
                <label className="label" htmlFor="cat-desc">Description</label>
                <textarea id="cat-desc" className="input" placeholder="Optional description…" rows={3}
                  value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button id="btn-save-category" type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving…' : editItem ? 'Save Changes' : 'Add Category'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm !== null && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#ffffff', border: '1px solid #fecaca', borderRadius: 16, padding: 32, maxWidth: 360, width: '100%', textAlign: 'center', boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.2)' }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🗑️</div>
            <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Delete Category?</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Events using this category may be affected.</p>
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
