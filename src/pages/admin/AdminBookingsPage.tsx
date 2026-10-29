import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  HiTicket, 
  HiPencilSquare, 
  HiChevronLeft, 
  HiChevronRight, 
  HiMagnifyingGlass,
  HiFunnel
} from 'react-icons/hi2';
import { bookingService, type Booking } from '../../services/bookingService';
import AdminLayout from '../../layouts/AdminLayout';

const STATUS_OPTIONS = ['CONFIRMED', 'CANCELLED', 'PENDING'];

export default function AdminBookingsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', page],
    queryFn: () => bookingService.getAllBookings({ page, size: 20 }),
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

  const raw = data?.data;
  const allBookings: Booking[] = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as any)?.content)
    ? (raw as any).content
    : [];

  const filteredBookings = useMemo(() => {
    return allBookings.filter((bk: Booking) => {
      const matchesStatus = statusFilter === 'ALL' || bk.status === statusFilter;
      const refStr = `#EH${String(bk.id).padStart(6, '0')}`.toLowerCase();
      const eventTitle = (bk.event?.title ?? '').toLowerCase();
      const customerName = (bk.user?.name ?? '').toLowerCase();
      const customerEmail = (bk.user?.email ?? '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = !q || 
        refStr.includes(q) || 
        eventTitle.includes(q) || 
        customerName.includes(q) || 
        customerEmail.includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [allBookings, statusFilter, searchQuery]);

  const pageSize = 8;
  const totalPages = Math.ceil(filteredBookings.length / pageSize) || 1;
  const pagedList = filteredBookings.slice(page * pageSize, (page + 1) * pageSize);

  const statusMap: Record<string, { cls: string }> = {
    CONFIRMED: { cls: 'badge-green'  },
    CANCELLED: { cls: 'badge-red'    },
    PENDING:   { cls: 'badge-yellow' },
  };

  return (
    <AdminLayout>
      <div className="page-container" style={{ maxWidth: 1100, padding: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
              <HiTicket style={{ color: '#7c3aed' }} />
              <span>Booking Management</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
              {allBookings.length} total bookings recorded in platform
            </p>
          </div>
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
                placeholder="Search by ref #, event, customer name or email..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setPage(0); }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
              <HiFunnel style={{ fontSize: 14 }} /> Filter Status:
            </span>
            {['ALL', ...STATUS_OPTIONS].map(st => (
              <button
                key={st}
                className={`filter-chip ${statusFilter === st ? 'active' : ''}`}
                onClick={() => { setStatusFilter(st); setPage(0); }}
              >
                {st === 'ALL' ? 'All Bookings' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Table */}
        <div className="table-container">
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="state-box">
              <div style={{ fontSize: 48, color: '#94a3b8', marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                <HiTicket />
              </div>
              <p style={{ color: '#64748b', fontWeight: 500 }}>No bookings match your current criteria.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {['Booking Ref', 'Event', 'Customer Details', 'Tickets', 'Amount', 'Booking Date', 'Status', 'Update Status'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedList.map((bk: Booking) => (
                    <tr key={bk.id}>
                      <td style={{ fontFamily: 'monospace', color: '#7c3aed', fontWeight: 700, fontSize: 13 }}>
                        #EH{String(bk.id).padStart(6, '0')}
                      </td>
                      <td>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
                          {bk.event?.title ?? '—'}
                        </p>
                        <p style={{ fontSize: 11, color: '#64748b' }}>
                          {bk.event?.venue?.city ? `📍 ${bk.event.venue.city}` : ''}
                        </p>
                      </td>
                      <td>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 2 }}>
                          {bk.user?.name ?? '—'}
                        </p>
                        <span style={{ fontSize: 11, color: '#64748b' }}>{bk.user?.email}</span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>
                        {bk.ticketCount}
                      </td>
                      <td style={{ fontWeight: 800, color: '#059669', fontSize: 14 }}>
                        {bk.totalAmount === 0 ? 'Free' : `₹${bk.totalAmount?.toLocaleString('en-IN')}`}
                      </td>
                      <td style={{ fontSize: 12, color: '#64748b' }}>
                        {bk.bookingDate ? new Date(bk.bookingDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                      </td>
                      <td>
                        <span className={`badge ${statusMap[bk.status]?.cls ?? 'badge-purple'}`}>
                          {bk.status}
                        </span>
                      </td>
                      <td>
                        {updatingId === bk.id ? (
                          <select
                            className="input"
                            style={{ fontSize: 12, padding: '6px 10px', width: 130 }}
                            defaultValue={bk.status}
                            onChange={e => statusMutation.mutate({ id: bk.id, status: e.target.value })}
                            autoFocus
                            onBlur={() => setUpdatingId(null)}
                          >
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setUpdatingId(bk.id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            <HiPencilSquare style={{ fontSize: 14 }} />
                            <span>Status</span>
                          </button>
                        )}
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
    </AdminLayout>
  );
}
