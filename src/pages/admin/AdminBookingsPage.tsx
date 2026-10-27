import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import AdminLayout from '../../layouts/AdminLayout';

const STATUS_OPTIONS = ['CONFIRMED', 'CANCELLED', 'PENDING'];

export default function AdminBookingsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', page, statusFilter],
    queryFn: () => bookingService.getAllBookings({ page, size: 12 }),
    retry: false,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      bookingService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-bookings'] });
      setUpdatingId(null);
    },
  });

  const bookings    = data?.data?.content    ?? [];
  const totalPages  = data?.data?.totalPages ?? 0;
  const totalItems  = data?.data?.totalElements ?? 0;

  const statusMap: Record<string, { cls: string }> = {
    CONFIRMED: { cls: 'badge-green'  },
    CANCELLED: { cls: 'badge-red'    },
    PENDING:   { cls: 'badge-yellow' },
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: 1100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: '#e2e8f0' }}>Booking Management</h1>
            <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{totalItems} total bookings</p>
          </div>
          <div>
            <select className="input" style={{ width: 180, fontSize: 13 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎟️</div>
              <p style={{ color: '#64748b' }}>No bookings found.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Ref', 'Event', 'Customer', 'Tickets', 'Amount', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((bk: any) => (
                  <tr key={bk.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '14px 16px', fontSize: 12, fontFamily: 'monospace', color: '#a78bfa' }}>
                      #EH{String(bk.id).padStart(6, '0')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{bk.event?.title ?? '—'}</p>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#94a3b8' }}>
                      {bk.user?.name ?? '—'}<br />
                      <span style={{ fontSize: 11, color: '#475569' }}>{bk.user?.email}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{bk.ticketCount}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: '#4ade80' }}>
                      {bk.totalAmount === 0 ? 'Free' : `₹${bk.totalAmount?.toLocaleString('en-IN')}`}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748b' }}>
                      {new Date(bk.bookingDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${statusMap[bk.status]?.cls ?? 'badge-purple'}`}>{bk.status}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {updatingId === bk.id ? (
                        <select
                          className="input" style={{ fontSize: 12, padding: '6px 10px', width: 140 }}
                          defaultValue={bk.status}
                          onChange={e => statusMutation.mutate({ id: bk.id, status: e.target.value })}
                          autoFocus
                          onBlur={() => setUpdatingId(null)}
                        >
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : (
                        <button className="btn btn-secondary btn-sm" onClick={() => setUpdatingId(bk.id)}>
                          ✏️ Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
            <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ fontSize: 13, color: '#64748b', padding: '0 12px', lineHeight: '32px' }}>Page {page + 1} of {totalPages}</span>
            <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
